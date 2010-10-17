<?php
class PostsController extends AppController {

	var $name = 'Posts';
	function index() {
		$this->set('posts', $this->Post->find('all'));
	}
	
	function view($id = null) {
		$this->Post->id = $id;
		$this->set('post', $this->Post->read());
	}
	function add() {
		if (!empty($this->data)) {
			if ($this->Post->save($this->data)) {
				$this->Session->setFlash('Your post has been saved.');
				$this->redirect(array('action' => 'index'));
			}
		}
	}
	function delete($id) {
		if ($this->Post->delete($id)) {
			$this->Session->setFlash('The post with id: ' . $id . ' has been deleted.');
			$this->redirect(array('action' => 'index'));
		}
	}
}
?>
