<?php
/**
 * Why choose — editable via SEOGBTools → Why Choose
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$svgs = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
];

$eyebrow = function_exists('sgb_content') ? (string) sgb_content('why.eyebrow', 'Why Choose Us') : 'Why Choose Us';
$title = function_exists('sgb_content') ? (string) sgb_content('why.title', 'Why So Many SEO Users Choose Us') : 'Why So Many SEO Users Choose Us';
$lead = function_exists('sgb_content') ? (string) sgb_content('why.lead', 'Clean access, quick setup, and pricing that makes sense for real-world SEO workflows.') : 'Clean access, quick setup, and pricing that makes sense for real-world SEO workflows.';
$cards = function_exists('sgb_content') ? sgb_content('why.cards', []) : [];
if (!is_array($cards) || $cards === []) {
    $cards = [
        ['title' => 'Secure Access That Feels Reliable', 'description' => 'Stable access with a setup designed for everyday SEO work without constant interruptions.'],
        ['title' => 'Fast Setup Without the Back and Forth', 'description' => 'Get started quickly with simple onboarding and fewer steps between you and your tools.'],
        ['title' => 'Help Is There When You Need It', 'description' => 'Support is available when you get stuck, so you can keep moving without losing time.'],
        ['title' => 'Simple Access for Daily Work', 'description' => 'A straightforward experience that makes it easy to run checks, research, and repeat.'],
        ['title' => 'Better Value Than Paying for Every Tool Alone', 'description' => 'Use the tools you actually need without stacking expensive individual subscriptions.'],
        ['title' => 'Built for People Who Use SEO Tools Every Day', 'description' => 'Great for freelancers, agencies, and teams who rely on SEO tools as part of their routine.'],
    ];
}
?>
<section class="sgb-why">
  <div class="sgb-why__dots" aria-hidden="true"></div>
  <div class="sgb-container" style="position:relative;z-index:1;">
    <div class="text-center sgb-anim-fade-up">
      <span class="sgb-eyebrow"><?php echo esc_html($eyebrow); ?></span>
      <h2><?php echo esc_html($title); ?></h2>
      <p class="sgb-section-lead"><?php echo esc_html($lead); ?></p>
    </div>
    <div class="sgb-why__grid">
      <?php foreach ($cards as $i => $f) : ?>
        <article class="sgb-why__card sgb-anim-scale">
          <div class="sgb-why__icon"><?php echo $svgs[$i % count($svgs)]; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
          <h3><?php echo esc_html((string) ($f['title'] ?? '')); ?></h3>
          <p><?php echo esc_html((string) ($f['description'] ?? '')); ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>
