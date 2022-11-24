import log from 'loglevel';
import type { NextApiRequest, NextApiResponse } from 'next';

log.setDefaultLevel(log.levels.DEBUG);

export default async function NeosRevalidate(req: NextApiRequest, res: NextApiResponse) {
  // Check for secret to confirm this is a valid request
  if (req.headers.authorization !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
    log.warn('Invalid token for revalidate request');

    return res.status(401).json({ error: 'Invalid token', revalidated: false });
  }

  try {
    if (Array.isArray(req.body.documents)) {
      log.debug(
        'Revalidating',
        req.body.documents.length,
        'pages',
        req.body.documents.map((doc: { routePath: string }) => doc.routePath)
      );

      // Revalidate all changed documents
      const promises = req.body.documents.map((document: { routePath: string }) => res.revalidate(document.routePath));
      await Promise.all(promises);

      log.debug('Revalidation done');
    }

    res.json({ revalidated: true });

    return;
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    log.error('Error revalidating', err);
    return res.status(500).json({ error: 'Error revalidating', revalidated: false });
  }
}
