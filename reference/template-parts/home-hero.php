<?php
/**
 * Brand hero — editable via SEOGBTools → Hero
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$signup = function_exists('sgb_get_option')
    ? (string) sgb_get_option('signup_url', 'https://members.seotoolsgroupbuy.us/signup')
    : 'https://members.seotoolsgroupbuy.us/signup';
$tools_label = function_exists('sgb_get_option')
    ? (string) sgb_get_option('catalog_tool_count_label', '40+')
    : '40+';
$price_label = function_exists('sgb_get_option')
    ? (string) sgb_get_option('plan_starting_price_label', 'From $10/mo')
    : 'From $10/mo';

$c = static function (string $key, string $fallback = '') {
    return function_exists('sgb_content') ? (string) sgb_content('hero.' . $key, $fallback) : $fallback;
};

$logos = [];
$logos_raw = $c('logos', "Ahrefs|ahrefs-logo.svg\nSEMrush|semrush-logo.svg\nMoz Pro|moz-logo.svg\nCanva|canva-logo.svg\nChatGPT|chatgpt-logo.svg\nJasper|jasper-logo.svg\nSurfer SEO|surferseo-logo.svg\nGrammarly|grammarly-logo.svg");
foreach (preg_split('/\r\n|\r|\n/', $logos_raw) ?: [] as $line) {
    $line = trim($line);
    if ($line === '') {
        continue;
    }
    $parts = array_map('trim', explode('|', $line, 2));
    $logos[] = [$parts[0], $parts[1] ?? 'seo-tools.svg'];
}
?>
<section class="sgb-hero">
  <div class="sgb-hero__glow" aria-hidden="true"></div>
  <div class="sgb-hero__grid" aria-hidden="true"></div>
  <div class="sgb-hero__inner">
    <h1>
      <span class="block"><?php echo esc_html($c('h1_line1', 'Unlock Premium Group Buy SEO Tools')); ?></span>
      <span class="sub"><?php echo esc_html($c('h1_line2', 'at Lower Cost')); ?></span>
    </h1>
    <p class="sgb-hero__lead"><?php echo esc_html($c('lead', 'Get instant access to Ahrefs, SEMrush, Moz Pro, Canva Pro, Jasper, and more with our Group Buy SEO Tools. Simplify your daily SEO, content, and research work without paying full price for every tool.')); ?></p>
    <div class="sgb-hero__ctas">
      <a class="sgb-btn sgb-btn--primary" href="<?php echo esc_url($signup); ?>" target="_blank" rel="noopener noreferrer">
        <?php echo esc_html($c('cta_primary', 'Get started')); ?>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </a>
      <a class="sgb-btn sgb-btn--ghost" href="<?php echo esc_url(home_url('/shop/')); ?>">
        <?php echo esc_html($c('cta_secondary', 'View pricing')); ?>
      </a>
    </div>
    <ul class="sgb-hero__stats" aria-label="<?php echo esc_attr($c('aria_stats', 'Platform highlights')); ?>">
      <li>
        <strong><?php echo esc_html($tools_label); ?></strong>
        <span><?php echo esc_html($c('stat1_label', 'Premium Tools')); ?></span>
      </li>
      <li>
        <strong><?php echo esc_html($c('stat2_value', 'Reliable')); ?></strong>
        <span><?php echo esc_html($c('stat2_label', 'Access')); ?></span>
      </li>
      <li>
        <strong><?php echo esc_html($c('stat3_value', 'Support')); ?></strong>
        <span><?php echo esc_html($c('stat3_label', 'When You Need It')); ?></span>
      </li>
    </ul>
    <p class="sgb-hero__note">
      <?php echo esc_html(trim($c('note_prefix', 'Affordable group-buy plans ·') . ' ' . $price_label)); ?>
    </p>
    <div class="sgb-hero__logos">
      <p><?php echo esc_html($c('logos_label', 'Includes Ahrefs, SEMrush, Jasper, Surfer SEO, Grammarly & more')); ?></p>
      <div class="sgb-hero__logos-row">
        <?php foreach ($logos as $logo) : ?>
          <img src="<?php echo esc_url(SGB_THEME_URI . '/assets/images/tools/' . $logo[1]); ?>" alt="<?php echo esc_attr($logo[0]); ?>" loading="lazy" />
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>
