import { ItemData } from '../typings/item';

export const Items: {
  [key: string]: ItemData | undefined;
} = {
  water: {
    name: 'water',
    close: false,
    label: 'VODA',
    stack: true,
    usable: true,
    count: 0,
  },
  weapon_pistol: {
    name: 'weapon_pistol',
    close: false,
    label: 'Pistol',
    stack: false,
    usable: true,
    ammoName: "9mm",
    count: 0,
  },
    powersaw: {
    name: 'powersaw',
    close: false,
    label: 'powersaw',
    stack: false,
    usable: true,
    count: 0,
  },
  burger: {
    name: 'burger',
    close: false,
    label: 'BURGR',
    stack: false,
    usable: false,
    count: 0,
  },
};
