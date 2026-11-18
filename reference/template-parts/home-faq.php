<?php
/**
 * FAQ — questions from CPT; chrome editable via SEOGBTools → FAQ chrome
 *
 * @package SEOGBTools
 */

declare(strict_types=1);

$faqs = function_exists('sgb_get_faqs') ? sgb_get_faqs() : sgb_default_faqs();
$c = static function (string $key, string $fb = '') {
    return function_exists('sgb_content') ? (string) sgb_content('faq.' . $key, $fb) : $fb;
};
$topics = function_exists('sgb_content_lines')
    ? sgb_content_lines('faq.topics')
    : [
        'What group buy SEO tools are',
        'Which tools you can access',
        'Plans, pricing, and what is included',
        'How the system works and how to start',
    ];
?>
<section class="sgb-faq">
  <div class="sgb-faq__q">
    <span class="sgb-eyebrow"><?php echo esc_html($c('eyebrow', 'FAQ')); ?></span>
    <h2><?php echo esc_html($c('title', 'Questions People Usually Ask')); ?></h2>
    <p class="intro"><?php echo esc_html($c('intro', 'Straight answers about pricing, what is included, and how to start. Pick a question to read the full reply.')); ?></p>
    <ul class="sgb-faq__topics">
      <?php foreach ($topics as $topic) : ?>
        <li><?php echo esc_html($topic); ?></li>
      <?php endforeach; ?>
    </ul>
    <ul class="sgb-faq__list" role="tablist" aria-label="<?php echo esc_attr($c('aria', 'FAQ questions')); ?>">
      <?php foreach ($faqs as $i => $faq) : ?>
        <li>
          <button
            type="button"
            id="faq-q-<?php echo esc_attr((string) $i); ?>"
            class="<?php echo $i === 0 ? 'is-active' : ''; ?>"
            data-sgb-faq="<?php echo esc_attr((string) $i); ?>"
            aria-controls="faq-a-<?php echo esc_attr((string) $i); ?>"
            aria-selected="<?php echo $i === 0 ? 'true' : 'false'; ?>"
          >
            <?php echo esc_html((string) $faq['question']); ?>
          </button>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
  <div class="sgb-faq__a">
    <?php foreach ($faqs as $i => $faq) : ?>
      <div
        id="faq-a-<?php echo esc_attr((string) $i); ?>"
        class="sgb-faq__panel<?php echo $i === 0 ? ' is-active' : ''; ?>"
        role="region"
        aria-labelledby="faq-q-<?php echo esc_attr((string) $i); ?>"
        <?php echo $i === 0 ? '' : 'hidden'; ?>
      >
        <?php echo wp_kses_post((string) $faq['answer']); ?>
      </div>
    <?php endforeach; ?>
  </div>
</section>
