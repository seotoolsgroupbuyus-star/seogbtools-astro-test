<?php
/**
 * Footer — matches Footer.tsx
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$year = (int) gmdate('Y');
$tagline = function_exists('sgb_get_option')
    ? (string) sgb_get_option('footer_tagline', 'Professional SEO & marketing tools at group-buy prices. Join thousands of marketers.')
    : 'Professional SEO & marketing tools at group-buy prices. Join thousands of marketers.';
$brand = function_exists('sgb_get_option') ? (string) sgb_get_option('brand_name', 'SEOGBTools') : 'SEOGBTools';
$rights = function_exists('sgb_get_option')
    ? (string) sgb_get_option('footer_rights', 'All rights reserved.')
    : 'All rights reserved.';
$brand_display = $brand;
if (stripos($brand_display, 'SEO') === 0 && strlen($brand_display) > 3) {
    $brand_html = '<span>SEO</span>' . esc_html(substr($brand_display, 3));
} else {
    $brand_html = esc_html($brand_display);
}

?>
</main>
<footer class="sgb-site-footer">
  <div class="sgb-container">
    <p class="brand"><?php echo $brand_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
    <p class="tag"><?php echo esc_html($tagline); ?></p>
    <p class="copy">&copy; <?php echo esc_html((string) $year); ?> <?php echo esc_html($brand); ?>. <?php echo esc_html($rights); ?></p>
  </div>
</footer>
<?php get_template_part('parts/floating-chat'); ?>
<?php wp_footer(); ?>
</body>
</html>
