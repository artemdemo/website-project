import { VariantOf, variant, fields } from 'variant';

export const HtmlAsset = variant({
  css: fields<{
    linkHref: string;
  }>(),
});
export type HtmlAsset = VariantOf<typeof HtmlAsset>;
