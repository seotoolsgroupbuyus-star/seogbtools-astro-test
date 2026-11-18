<?php
/**
 * Tools collection — chrome editable; cards from CPT/JSON
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$items = sgb_homepage_tool_items();
$initial = 20;
$c = static function (string $key, string $fb = '') {
    return function_exists('sgb_content') ? (string) sgb_content('tools.' . $key, $fb) : $fb;
};
$cats = function_exists('sgb_content') ? sgb_content('tools.cats', []) : [];
if (!is_array($cats) || $cats === []) {
    $cats = [
        ['title' => 'Popular SEO Tools', 'desc' => 'Keyword research, audits, backlinks, and competitor analysis.'],
        ['title' => 'Content and Writing Tools', 'desc' => 'Rewrite, grammar, outlines, and content workflows.'],
        ['title' => 'Design and Creative Tools', 'desc' => 'Design assets, templates, video tools, and creative suites.'],
        ['title' => 'Other SEO Services', 'desc' => 'Extra utilities, trackers, and supporting tools.'],
    ];
}
$view_more_tpl = $c('view_more', 'View More Tools (%d more)');
?>
<section class="sgb-tools" aria-label="<?php echo esc_attr($c('aria', 'Premium Marketing Tools Collection')); ?>">
  <div class="sgb-tools__dots" aria-hidden="true"></div>
  <div class="sgb-container" style="position:relative;z-index:1;">
    <div class="text-center">
      <span class="sgb-eyebrow"><?php echo esc_html($c('eyebrow', 'Tools Collection')); ?></span>
      <h2><?php echo esc_html($c('title', 'Popular SEO Tools You Can Access')); ?></h2>
      <p class="sgb-section-lead"><?php echo esc_html($c('lead', 'Find the tools you already use, and get access without paying for every subscription separately.')); ?></p>
    </div>

    <div class="sgb-tools__cats">
      <?php foreach ($cats as $cat) : ?>
        <div class="sgb-tools__cat">
          <h3><?php echo esc_html((string) ($cat['title'] ?? '')); ?></h3>
          <p><?php echo esc_html((string) ($cat['desc'] ?? '')); ?></p>
        </div>
      <?php endforeach; ?>
    </div>

    <div class="sgb-tools__grid" id="sgb-home-tools" data-visible="<?php echo esc_attr((string) $initial); ?>">
      <?php foreach ($items as $i => $tool) : ?>
        <?php
        // Next.js parity: always /{slug}/ — never /product/{slug}/
        $href = function_exists('sgb_product_root_url')
            ? sgb_product_root_url((string) $tool['slug'])
            : home_url('/' . trailingslashit((string) $tool['slug']));
        ?>
        <a class="sgb-tool-card<?php echo $i >= $initial ? ' sgb-is-hidden' : ''; ?>" href="<?php echo esc_url($href); ?>" data-sgb-tool-card<?php echo $i >= $initial ? ' hidden' : ''; ?>>
          <div class="sgb-tool-card__logo" style="background:<?php echo esc_attr((string) $tool['bgColor']); ?>">
            <img
              src="<?php echo esc_url((string) $tool['image']); ?>"
              alt="<?php echo esc_attr((string) $tool['name']); ?>"
              loading="lazy"
              onerror="this.onerror=null;this.src='<?php echo esc_url(SGB_THEME_URI . '/assets/images/tools/seo-tools.svg'); ?>'"
            />
          </div>
          <div class="sgb-tool-card__name"><?php echo esc_html((string) $tool['name']); ?></div>
          <div class="sgb-tool-card__price">
            <span class="price"><?php echo esc_html((string) $tool['price']); ?></span>
            <?php if (!empty($tool['priceSubtitle'])) : ?>
              <span class="sub"><?php echo esc_html((string) $tool['priceSubtitle']); ?></span>
            <?php endif; ?>
          </div>
          <div class="sgb-tool-card__cta"><?php echo esc_html($c('view_details', 'View Details')); ?></div>
        </a>
      <?php endforeach; ?>
    </div>

    <?php if (count($items) > $initial) : ?>
      <div class="text-center" style="margin-top:3rem;">
        <button type="button" class="sgb-btn sgb-btn--more" data-sgb-tools-more data-step="20" data-total="<?php echo esc_attr((string) count($items)); ?>">
          <span data-sgb-more-label>
            <?php echo esc_html(sprintf($view_more_tpl, count($items) - $initial)); ?>
          </span>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>
    <?php endif; ?>
  </div>
</section>
