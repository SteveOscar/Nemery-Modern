// src/constants/game.js
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor(width * 0.2);
const CELL_PADDING = Math.floor(CELL_SIZE * 0.07);
const BORDER_RADIUS = CELL_PADDING * 1;
const TILE_SIZE = CELL_SIZE - CELL_PADDING * 2;
const NUMBER_SIZE = Math.floor(TILE_SIZE * 0.70);

export { CELL_SIZE, CELL_PADDING, BORDER_RADIUS, TILE_SIZE, NUMBER_SIZE };