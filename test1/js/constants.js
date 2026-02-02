const CELL_SIZE = 100;
const GRID_ROWS = 5;
const GRID_COLS = 9;
const HEADER_OFFSET = 100; // 顶部预留给UI或菜单的空间，这里设为0或者其他值，根据canvas布局调整
// 实际上我们的canvas全屏，所以我们可以通过margin来控制
// 这里我们假设canvas正好是 900x600, 每格100x100
// 上面留100px给 UI 面板 (虽然UI是悬浮的，但在canvas里我们可以留出顶部草坪的边缘)
// 或者我们简单点，整个canvas就是草坪 9x5 = 900x500 ? 
// 让我们设定 canvas 900x600. 
// 上方 100px 是状态栏区域（背景），下面 500px 是 5行格子

const CELL_WIDTH = 100;
const CELL_HEIGHT = 100;
const TOP_OFFSET = 100; // 游戏区域距离顶部的偏移量

// 游戏状态
const GAME_STATE = {
    START: 0,
    PLAYING: 1,
    GAME_OVER: 2
};

// 颜色定义
const COLORS = {
    GRASS_LIGHT: '#66cc66',
    GRASS_DARK: '#55bb55',
    HOVER: 'rgba(255, 255, 255, 0.3)'
};

// 图片资源
const zombieImage = new Image();
zombieImage.src = 'images/zombie.png';

const FPS = 60;
