<h2><?= $post['Post']['title']?></h2>
<h4>Created <?= $post['Post']['created']?></h4>
<div><?= $post['Post']['body']?></div>
<?= $this->Html->link('Back to Recent Posts', array('controller' => 'posts', 'action' => 'index'))?>