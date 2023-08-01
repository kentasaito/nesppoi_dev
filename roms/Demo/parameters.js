export const parameters = {

	// 着地面の高さ
	landingLevel: 8 * 25,


	/* ロード時 */
	// X軸位置
	onLoadX: 0,

	// Y軸位置
	onLoadY: 8 * 6,

	// X軸速度
	onLoadVelocityX: 16,

	// Y軸速度
	onLoadVelocityY: -64,


	/* 着地時 */
	// 地面の摩擦
	friction: 1,

	// ジャンプ時の初速
	initialVelocityY: -58,

	// 移動時の初速
	initialVelocityX: 32,


	/* 浮遊時 */
	// 重力
	gravity: 6,

	// 浮遊時の加速度
	floatingAccelerationY: -5,

	// 浮遊時のX軸の最高速度
	floatingMaxVelocityX: 16,

	// 浮遊時のX軸の加速度
	floatingAccelerationX: 3,
};
