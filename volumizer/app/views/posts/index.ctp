<h2>Most Recent Posts</h2>
<table>
<?php foreach($posts as $post) { ?>
	<tr>
	<td><?= $this->Html->link($post['Post']['title'], array('controller' => 'posts', 'action' => 'view', $post['Post']['id']))?></td>
	<td><?= $this->Html->link('Edit', array('controller' => 'posts', 'action' => 'edit', $post['Post']['id']))?></td>
	<td><?= " ".$this->Html->link('Delete', array('action' => 'delete', $post['Post']['id']), null, 'Are you sure?')?></td>
	</tr>
<?php } ?>
</table>
<?= $this->Html->link('Add a Post', array('controller' => 'posts', 'action' => 'add'));
