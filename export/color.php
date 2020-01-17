<?php
	/*function cdechex($number) {
		return ($number < 16) ? "0".strtoupper(dechex($number)) : strtoupper(dechex($number));
	}*/

	function sort_colors($a,$b) {
		return $b->occur - $a->occur;
	}

	class Color {
		public $name = "";
		public $hex = "";
		/*public $red = 0;
		public $green = 0;
		public $blue = 0;*/
		public $occur = 1;
		
		public function __construct($n, $v) {
			$this->name = $n;
			$this->hex = $v;
			//$this->refreshRays();
		}
		
		public function toString() {
			return $this->hex;
		}
		/*public function refreshHex() {
			$this->hex = "#".cdechex($this->red).cdechex($this->green).cdechex($this->blue);
		}
		public function refreshRays() {
			$this->red = hexdec(substr($this->hex, 1, 2));
			$this->green = hexdec(substr($this->hex, 3, 2));
			$this->blue = hexdec(substr($this->hex, 5, 3));
		}*/
	}
?>
