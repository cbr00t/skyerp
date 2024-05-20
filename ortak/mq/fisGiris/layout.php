<template id="fisGiris" class="part">
	<div class="fisGiris part">
		<div class="islemTuslari"></div>
		<div class="main-split split dock-bottom">
			<div>
				<div class="headerDipOrtak split dock-bottom">
					<div class="header basic-hidden">
						<div class="baslikFormlar">
							<div class="tsnForm sub-parent flex-row jqx-hidden">
								<?php require("$webRoot/ortak/mq/numarator/form/layout.php") ?>
								<?php require("$webRoot/ortak/mq/ticNumarator/form/layout.php") ?>
							</div>
							<div class="baslikForm1 baslikForm sub-parent"></div>
							<div class="baslikForm2 baslikForm sub-parent"></div>
							<div class="baslikForm3 baslikForm sub-parent"></div>
						</div>
					</div>
					<div class="dipForm jqx-hidden">
						<?php require("$webRoot/ortak/mq/fisGiris/fisDip/layout.php") ?>
					</div>
				</div>
			</div>

			<div>
				<div class="gridVeIslemTuslari split">
					<div class="gridIslemTuslari dock-bottom"></div>
					<?php require("$webRoot/ortak/grid/gridPart/gridLayout.php") ?>
				</div>
			</div>
		</div>
	</div>
</template>
