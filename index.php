<!doctype html>
<meta charset="utf-8">
<body style="margin:0;">
	<div>
		<?php for ($padIndex = 0; $padIndex < 2; $padIndex++): ?>
		<h3>pads<?php echo $padIndex; ?></h3>
		<table id="pads<?php echo $padIndex; ?>">
			<tr>
				<th>Right</th>
				<th>Left</th>
				<th>Down</th>
				<th>Up</th>
				<th>Select</th>
				<th>Start</th>
				<th>B</th>
				<th>A</th>
			</tr>
			<tr>
<?php for ($keyIndex = 0; $keyIndex < 8; $keyIndex++): ?>
				<td><input class="keys<?php echo $keyIndex; ?>" onfocus="this.select();" onkeydown="event.stopPropagation(); System.pads[<?php echo $padIndex; ?>].configKey(<?php echo $keyIndex; ?>, event.key); return false;" style="width:5rem; text-align:center;"></td>
<?php endfor; ?>
			</tr>
		</table>
		<?php endfor; ?>
		<h3>Load local ROM</h3>
		<input webkitdirectory type="file" onchange="for (const file of event.target.files) if (file.name === 'Rom.js') System.loadRom(file.webkitRelativePath.replace('/' + file.name, ''));">
		<h3>Full screen</h3>
		<button id="fullscreen">Fullscreen Mode</button>
	</div>
	<div id="screenContainer">
		<div id="screen" style="position:relative; width:256px; height:240px; overflow:hidden; transform-origin:0 0; transform:scale(1);">
		</div>
	</div>
</body>

<script>
System = undefined;
</script>
<script type="module">
import { System } from './System.js';
window.System = System;
System.start();
</script>
