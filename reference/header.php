<?php
/**
 * Header — matches Next.js components/Header.tsx
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$wa = function_exists('sgb_get_option')
    ? (string) sgb_get_option('whatsapp_url', 'https://wa.me/447845432224')
    : 'https://wa.me/447845432224';
$fb = function_exists('sgb_get_option')
    ? (string) sgb_get_option('messenger_url', 'https://m.me/108606453898810')
    : 'https://m.me/108606453898810';
$nav_pages = function_exists('sgb_header_nav_pages') ? sgb_header_nav_pages() : [];
$n = static function (string $key, string $fb = '') {
    return function_exists('sgb_content') ? (string) sgb_content('nav.' . $key, $fb) : $fb;
};
$brand = function_exists('sgb_get_option') ? (string) sgb_get_option('brand_name', 'seogbtools') : 'seogbtools';
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="sgb-site-header">
  <div class="sgb-site-header__wrap">
    <div class="sgb-site-header__pill">
      <nav class="sgb-nav-left" aria-label="<?php echo esc_attr($n('aria_primary', 'Primary')); ?>">
        <a href="<?php echo esc_url(home_url('/')); ?>"><?php echo esc_html($n('home', 'Home')); ?></a>
        <a href="<?php echo esc_url(home_url('/blog/')); ?>"><?php echo esc_html($n('blog', 'Blog')); ?></a>
        <a href="<?php echo esc_url(home_url('/shop/')); ?>"><?php echo esc_html($n('shop', 'Shop')); ?></a>
        <div class="sgb-nav-pages">
          <a href="<?php echo esc_url(home_url('/pages/')); ?>" class="sgb-nav-pages__trigger">
            <span><?php echo esc_html($n('pages', 'Pages')); ?></span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </a>
          <div class="sgb-nav-pages__menu">
            <a class="sgb-nav-pages__all" href="<?php echo esc_url(home_url('/pages/')); ?>">
              <span><?php echo esc_html($n('view_all', 'View All Pages')); ?></span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
            </a>
            <?php foreach ($nav_pages as $np) : ?>
              <a href="<?php echo esc_url(home_url('/' . trailingslashit((string) $np['slug']))); ?>">
                <?php echo esc_html((string) $np['title']); ?>
              </a>
            <?php endforeach; ?>
          </div>
        </div>
      </nav>

      <a class="sgb-brand-center" href="<?php echo esc_url(home_url('/')); ?>"><?php echo esc_html(strtolower($brand)); ?></a>

      <div class="sgb-nav-right">
        <a class="sgb-icon-btn sgb-icon-btn--wa" href="<?php echo esc_url($wa); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr($n('whatsapp_aria', 'WhatsApp')); ?>">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </a>
        <a class="sgb-icon-btn sgb-icon-btn--fb" href="<?php echo esc_url($fb); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr($n('facebook_aria', 'Facebook')); ?>">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
      </div>

      <button type="button" class="sgb-mobile-toggle" data-sgb-menu-toggle aria-expanded="false" aria-controls="sgb-mobile-menu">
        <span class="sr-only"><?php echo esc_html($n('open_menu', 'Open menu')); ?></span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <line x1="4" x2="20" y1="6" y2="6" stroke-width="2" stroke-linecap="round" />
          <line x1="4" x2="20" y1="12" y2="12" stroke-width="2" stroke-linecap="round" />
          <line x1="4" x2="20" y1="18" y2="18" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div id="sgb-mobile-menu" class="sgb-mobile-menu" hidden>
      <a href="<?php echo esc_url(home_url('/')); ?>"><?php echo esc_html($n('home', 'Home')); ?></a>
      <a href="<?php echo esc_url(home_url('/blog/')); ?>"><?php echo esc_html($n('blog', 'Blog')); ?></a>
      <a href="<?php echo esc_url(home_url('/shop/')); ?>"><?php echo esc_html($n('shop', 'Shop')); ?></a>
      <a href="<?php echo esc_url(home_url('/pages/')); ?>"><?php echo esc_html($n('pages', 'Pages')); ?></a>
      <div class="sgb-mobile-menu__social">
        <a class="sgb-icon-btn sgb-icon-btn--wa" href="<?php echo esc_url($wa); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr($n('whatsapp_aria', 'WhatsApp')); ?>">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </a>
        <a class="sgb-icon-btn sgb-icon-btn--fb" href="<?php echo esc_url($fb); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr($n('facebook_aria', 'Facebook')); ?>">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
      </div>
    </div>
  </div>
</header>
<main id="content" class="sgb-main">
