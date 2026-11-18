<?php
/**
 * Shared shop grid (WooCommerce products).
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$products = function_exists('sgb_wc_shop_products') ? sgb_wc_shop_products(300) : [];
$total = count($products);
$sc = static function (string $key, string $fb = '') {
    return function_exists('sgb_content') ? (string) sgb_content('shop.' . $key, $fb) : $fb;
};
$lead_tpl = $sc('lead', 'Browse our complete collection of %d+ premium SEO tools');
$buy_label = $sc('buy_now', 'Buy Now');
$sale_label = $sc('sale', 'Sale!');
?>
<section class="sgb-shop">
  <div class="sgb-container">
    <h1><?php echo esc_html($sc('title_prefix', 'Premium')); ?> <span><?php echo esc_html($sc('title_accent', 'SEO Tools')); ?></span></h1>
    <p class="sgb-shop__lead">
      <?php echo esc_html(sprintf($lead_tpl, (int) $total)); ?>
    </p>
    <?php if ($total === 0) : ?>
      <p class="sgb-shop__lead"><?php echo esc_html($sc('empty', 'No products found matching your search.')); ?></p>
    <?php else : ?>
    <div class="sgb-shop__search">
      <input type="search" id="sgb-shop-search" placeholder="<?php echo esc_attr($sc('search', 'Search for tools...')); ?>" autocomplete="off" />
    </div>
    <div class="sgb-shop__meta" id="sgb-shop-meta">
      <?php
      printf(
          esc_html($sc('showing', 'Showing %1$d - %2$d of %3$d products')),
          1,
          min(20, $total),
          $total
      );
      ?>
    </div>
    <div class="sgb-products" id="sgb-products">
      <?php foreach ($products as $i => $p) : ?>
        <?php
        $href = (string) ($p['permalink'] ?? home_url('/shop/'));
        $buy = !empty($p['buy_url']) && $p['buy_url'] !== '#'
            ? (string) $p['buy_url']
            : (function_exists('sgb_get_option')
                ? (string) sgb_get_option('signup_url', 'https://members.seotoolsgroupbuy.us/signup')
                : 'https://members.seotoolsgroupbuy.us/signup');
        ?>
        <article class="sgb-product-card" data-sgb-product data-name="<?php echo esc_attr(strtolower((string) $p['name'] . ' ' . $p['description'])); ?>"<?php echo $i >= 20 ? ' hidden' : ''; ?>>
          <a class="sgb-product-card__media" href="<?php echo esc_url($href); ?>" style="background:<?php echo esc_attr((string) $p['bg']); ?>">
            <?php if (!empty($p['on_sale'])) : ?>
              <span class="sgb-badge"><?php echo esc_html($sale_label); ?></span>
            <?php endif; ?>
            <img src="<?php echo esc_url((string) $p['image']); ?>" alt="<?php echo esc_attr((string) $p['name']); ?>" loading="lazy" />
          </a>
          <div class="sgb-product-card__body">
            <?php if (!empty($p['category'])) : ?>
              <div class="sgb-product-card__cat"><?php echo esc_html((string) $p['category']); ?></div>
            <?php endif; ?>
            <h3><a href="<?php echo esc_url($href); ?>"><?php echo esc_html((string) $p['name']); ?></a></h3>
            <div class="sgb-product-card__desc"><?php echo esc_html(wp_html_excerpt((string) $p['description'], 120, '…')); ?></div>
            <div class="sgb-product-card__price">
              <span class="now">$<?php echo esc_html(rtrim(rtrim(number_format((float) $p['current'], 2, '.', ''), '0'), '.') ?: '0'); ?></span>
              <?php if (!empty($p['compare'])) : ?>
                <span class="was">$<?php echo esc_html(rtrim(rtrim(number_format((float) $p['compare'], 2, '.', ''), '0'), '.')); ?></span>
              <?php endif; ?>
            </div>
            <a class="sgb-buy" href="<?php echo esc_url($buy); ?>" target="_blank" rel="noopener noreferrer">
              <?php echo esc_html($buy_label); ?>
            </a>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
    <nav class="sgb-shop-pager" id="sgb-shop-pager" aria-label="<?php echo esc_attr(function_exists('sgb_content') ? (string) sgb_content('shop_ui.pagination', 'Shop pagination') : 'Shop pagination'); ?>"<?php echo $total <= 20 ? ' hidden' : ''; ?>></nav>
    <?php endif; ?>
  </div>
</section>
