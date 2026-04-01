import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const isTablet = width >= 700;
export const MAX_CONTENT_WIDTH = 720; // Industry standard for readable tablet content
export const SCREEN_WIDTH = width;