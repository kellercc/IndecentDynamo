<?php
	App::import('Model','Post'); 

   
   	class PostTestCase extends CakeTestCase { 
		var $fixtures = array( 'app.post' );

		function testMath() {
			$this->assertEqual(20+22,42);
			//echo 'Math: it works, man!';
		}

		function testPosts() {
            $this->Post =& ClassRegistry::init('Post');
    
            $result = $this->Post->find('all', array('fields' => array('id', 'title')));
            $expected = array(
                array('Post' => array( 'id' => 1, 'title' => 'First Article' )),
                array('Post' => array( 'id' => 2, 'title' => 'Second Article' )),
                array('Post' => array( 'id' => 3, 'title' => 'Third Article' ))
            );
    
            $this->assertEqual($result, $expected);
        }
    } 
?>
