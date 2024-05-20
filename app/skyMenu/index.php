<?php require_once('config.php')?>
<!DOCTYPE html>
<html lang="tr">
<head>
	<?php require_once("$webRoot/lib/include/head.php")?>
</head>
<body>
	<?php require_once("$webRoot/lib/include/ortak-layout.php")?>

	<div id="root-parent">
		<!--<button id="nav-toggle" class="jqx-hidden"></button>-->
		<div id="ust-parent" class="flex-row">
			<!--<nav id="nav"></nav>-->
			<div id="parent">
				<div id="windows-parent">
					<div id="windows-parent-ic">
						<nav id="windows">
							<ul class="tabs flex-row"></ul>
						</nav>
					</div>
				</div>
				<main id="content" class="jqx-hidden">
					<div class="panel-programlar panel">
						<div id="programlar"></div>
					</div>
					<div class="panel-vtListe panel">
						<div id="vtListe"></div>
					</div>
				</main>
			</div>
		</div>
	</div>
</body>
</html>
