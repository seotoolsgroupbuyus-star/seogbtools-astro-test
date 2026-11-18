<?php
/**
 * Pricing — plans from CPT; chrome editable via SEOGBTools → Pricing chrome
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$plans = function_exists('sgb_get_pricing_plans') ? sgb_get_pricing_plans() : sgb_default_pricing_plans();
$signup = function_exists('sgb_get_option')
    ? (string) sgb_get_option('signup_url', 'https://members.seotoolsgroupbuy.us/signup')
    : 'https://members.seotoolsgroupbuy.us/signup';
$c = static function (string $key, string $fb = '') {
    return function_exists('sgb_content') ? (string) sgb_content('pricing.' . $key, $fb) : $fb;
};
?>
<section class="sgb-pricing" id="pricing" aria-label="<?php echo esc_attr($c('aria', 'Subscription Pricing Plans')); ?>">
  <div class="sgb-pricing__dots" aria-hidden="true"></div>
  <div class="sgb-container" style="position:relative;z-index:1;">
    <div class="text-center">
      <span class="sgb-eyebrow sgb-eyebrow--purple"><?php echo esc_html($c('eyebrow', 'Pricing Plans')); ?></span>
      <h2><?php echo esc_html($c('title', 'SEO Tools Plans That Fit the Way You Work')); ?></h2>
      <p class="sgb-section-lead"><?php echo esc_html($c('lead', 'Choose a simple plan, then start using your tools right away.')); ?></p>
    </div>
    <div class="sgb-pricing__grid">
      <?php foreach ($plans as $plan) : ?>
        <?php
        $tools = array_values((array) ($plan['tools'] ?? []));
        $count = count($tools);
        $popular = !empty($plan['popular']);
        ?>
        <div class="sgb-flip" data-sgb-flip>
          <div class="sgb-flip__inner">
            <article class="sgb-plan sgb-flip__face sgb-flip__front<?php echo $popular ? ' sgb-plan--popular' : ''; ?>">
              <div class="sgb-plan__icon" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>
              <h3><?php echo esc_html((string) $plan['name']); ?></h3>
              <h4 class="sgb-plan__included">
                <?php echo esc_html(sprintf($c('included', 'Included Tools (%d)'), $count)); ?>
              </h4>
              <div class="sgb-plan__price">
                <span class="amount"><?php echo esc_html((string) $plan['price']); ?></span>
                <span class="per"><?php echo esc_html($c('per_month', '/month')); ?></span>
              </div>
              <div class="sgb-plan__top-label"><?php echo esc_html($c('top_tools', 'Top tools in this plan')); ?></div>
              <ul>
                <?php foreach (array_slice($tools, 0, 5) as $tool) : ?>
                  <li><?php echo esc_html((string) $tool); ?></li>
                <?php endforeach; ?>
              </ul>
              <button type="button" class="sgb-plan__view" data-sgb-flip-open>
                <?php echo esc_html(sprintf($c('view_all', 'View all %d tools →'), $count)); ?>
              </button>
              <?php
              $plan_buy = (string) ($plan['buy_url'] ?? '');
              if ($plan_buy === '' || $plan_buy === '#') {
                  $plan_buy = $signup;
              }
              ?>
              <a class="sgb-btn sgb-btn--buy<?php echo $popular ? ' sgb-btn--buy-popular' : ''; ?>" href="<?php echo esc_url($plan_buy); ?>" target="_blank" rel="noopener noreferrer">
                <?php echo esc_html($c('buy_now', 'Buy Now')); ?>
              </a>
            </article>
            <article class="sgb-plan sgb-flip__face sgb-flip__back<?php echo $popular ? ' sgb-plan--popular' : ''; ?>">
              <p class="sgb-plan__complete"><?php echo esc_html($c('complete_list', 'Complete list')); ?></p>
              <ul class="sgb-plan__full">
                <?php foreach ($tools as $tool) : ?>
                  <li><?php echo esc_html((string) $tool); ?></li>
                <?php endforeach; ?>
              </ul>
              <button type="button" class="sgb-btn sgb-btn--back<?php echo $popular ? ' sgb-btn--buy-popular' : ''; ?>" data-sgb-flip-close>
                ← <?php echo esc_html($c('back', 'Back to Plan')); ?>
              </button>
            </article>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
