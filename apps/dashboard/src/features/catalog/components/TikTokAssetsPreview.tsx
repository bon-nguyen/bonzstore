import { TikTokCategoryAssetsResponse } from '../../../api/types/catalog.types';

export interface TikTokAssetsPreviewProps {
  assets: TikTokCategoryAssetsResponse;
}

export function TikTokAssetsPreview({ assets }: TikTokAssetsPreviewProps) {
  return (
    <div className="stat-card space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-bold uppercase text-foreground dark:text-primary">
          GET /api/categories/assets (TikTok Shop 202405 Response Envelope)
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          request_id: {assets.request_id}
        </span>
      </div>
      <pre className="max-h-72 overflow-auto rounded-lg bg-tiktok p-4 font-mono text-xs text-mint">
        {JSON.stringify(assets, null, 2)}
      </pre>
    </div>
  );
}

