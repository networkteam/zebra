import PromisePool from '@supercharge/promise-pool/dist';
import log from 'loglevel';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiErrors, DocumentsResponse } from '../types';
import { buildNeosHeaders } from '../utils/helper';

log.setDefaultLevel(log.levels.DEBUG);

export default async function NeosRevalidateAll(req: NextApiRequest, res: NextApiResponse) {
  // Check for secret to confirm this is a valid request
  if (req.headers.authorization !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
    log.warn('Invalid token for revalidate request');

    return res.status(401).json({ error: 'Invalid token', revalidated: false });
  }

  const startTime = Date.now();

  try {
    const apiUrl = process.env.NEOS_BASE_URL;
    if (!apiUrl) {
      throw new Error('Missing NEOS_BASE_URL environment variable');
    }
    const fetchUrl = apiUrl + '/neos/content-api/documents';
    const response = await fetch(fetchUrl, {
      headers: buildNeosHeaders(),
    });

    if (!response.ok) {
      const data: ApiErrors = await response.json();
      if (data.errors) {
        const flatErrors = data.errors.map((e) => e.message).join(', ');
        log.error('revalidate: error fetching from content API with url', fetchUrl, ':', flatErrors);
        throw new Error('Content API responded with error: ' + flatErrors);
      }
    }

    const data: DocumentsResponse = await response.json();

    await PromisePool.withConcurrency(revalidateConcurrency())
      .for(data.documents)
      .process(async ({ routePath }) => {
        log.debug('Revalidating', routePath);
        await res.revalidate(routePath);
      });

    const endTime = Date.now();
    log.debug('Revalidation done after, took', `${endTime - startTime}ms`);

    res.json({ revalidated: true });

    return;
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    log.error('Error revalidating', err);
    return res.status(500).json({ error: 'Error revalidating', revalidated: false });
  }
}

const defaultRevalidateConcurrency = 2;

const revalidateConcurrency = () => {
  const concurrency = process.env.REVALIDATE_CONCURRENCY;
  if (!concurrency) {
    return defaultRevalidateConcurrency;
  }

  const concurrencyInt = parseInt(concurrency, 10);
  if (isNaN(concurrencyInt)) {
    return defaultRevalidateConcurrency;
  }

  return concurrencyInt;
};
