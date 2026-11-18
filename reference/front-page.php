<?php
/**
 * Homepage — same section order as Next.js app/page.tsx
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

get_header();
get_template_part('template-parts/home', 'hero');
get_template_part('template-parts/home', 'why-choose');
get_template_part('template-parts/home', 'tools');
get_template_part('template-parts/home', 'pricing');
get_template_part('template-parts/home', 'content');
get_template_part('template-parts/home', 'faq');
get_footer();

