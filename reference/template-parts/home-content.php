<?php
/**
 * Homepage content — editable via SEOGBTools → Spotlight / How-it-works
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$tools = function_exists('sgb_homepage_spotlight_tools') ? sgb_homepage_spotlight_tools() : [];
$steps = function_exists('sgb_homepage_how_steps') ? sgb_homepage_how_steps() : [];
$c = static function (string $key, string $fb = '') {
    return function_exists('sgb_content') ? (string) sgb_content('content.' . $key, $fb) : $fb;
};
?>
<section class="sgb-content">
  <div class="sgb-content__dots" aria-hidden="true"></div>
  <div class="sgb-container" style="position:relative;z-index:1;">
    <div class="sgb-content__block">
      <div class="text-center">
        <span class="sgb-eyebrow sgb-eyebrow--orange"><?php echo esc_html($c('spotlight_eyebrow', 'Tool spotlight')); ?></span>
        <h2><?php echo esc_html($c('spotlight_title', 'Popular Tools Included')); ?></h2>
        <p class="sgb-section-lead"><?php echo esc_html($c('spotlight_lead', 'A quick look at what people use most for research, audits, content, and daily SEO work.')); ?></p>
      </div>

      <div class="sgb-content__info">
        <div class="sgb-content__info-card">
          <h3><?php echo esc_html($c('featured_title', 'Featured SEO Tools')); ?></h3>
          <p><?php echo esc_html($c('featured_text', 'Core SEO research tools people rely on for rankings, audits, and backlinks.')); ?></p>
        </div>
        <div class="sgb-content__info-card">
          <h3><?php echo esc_html($c('more_title', 'More Tools Available')); ?></h3>
          <p><?php echo esc_html($c('more_text', 'Content, writing, and creative tools are included across plans, with more added over time.')); ?></p>
          <h4><?php echo esc_html($c('other_title', 'Other SEO Services')); ?></h4>
          <p><?php echo esc_html($c('other_text', 'Beyond Ahrefs, SEMrush, and Moz, packages can include audits, rank monitoring, and supporting SEO utilities depending on your plan.')); ?></p>
        </div>
      </div>

      <div class="sgb-content__tools">
        <?php foreach ($tools as $tool) : ?>
          <article class="sgb-content__tool">
            <div class="sgb-content__badge sgb-content__badge--<?php echo esc_attr((string) $tool['color']); ?>">
              <?php echo esc_html((string) $tool['name']); ?>
            </div>
            <p><?php echo esc_html((string) $tool['description']); ?></p>
            <ul>
              <?php foreach ((array) $tool['features'] as $feature) : ?>
                <li><span>✓</span> <?php echo esc_html((string) $feature); ?></li>
              <?php endforeach; ?>
            </ul>
          </article>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="sgb-content__block">
      <div class="text-center">
        <span class="sgb-eyebrow sgb-eyebrow--green"><?php echo esc_html($c('how_eyebrow', 'How it works')); ?></span>
        <h2><?php echo esc_html($c('how_title', 'How Group Buy SEO Tools Work')); ?></h2>
        <p class="sgb-section-lead"><?php echo esc_html($c('how_lead', 'Create your account, choose a plan, and start using your tools.')); ?></p>
      </div>
      <div class="sgb-content__steps">
        <?php foreach ($steps as $step) : ?>
          <article class="sgb-content__step">
            <div class="sgb-content__step-num"><?php echo esc_html((string) $step['number']); ?></div>
            <div class="sgb-content__step-icon" aria-hidden="true"><?php echo esc_html((string) $step['icon']); ?></div>
            <h3><?php echo esc_html((string) $step['title']); ?></h3>
            <p><?php echo esc_html((string) $step['description']); ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>
