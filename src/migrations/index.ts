import * as migration_20261009_173137_initial from './20261009_173137_initial';
import * as migration_20261010_145249_home_status_renders from './20261010_145249_home_status_renders';
import * as migration_20261011_071040_home_network from './20261011_071040_home_network';

export const migrations = [
  {
    up: migration_20261009_173137_initial.up,
    down: migration_20261009_173137_initial.down,
    name: '20261009_173137_initial',
  },
  {
    up: migration_20261010_145249_home_status_renders.up,
    down: migration_20261010_145249_home_status_renders.down,
    name: '20261010_145249_home_status_renders',
  },
  {
    up: migration_20261011_071040_home_network.up,
    down: migration_20261011_071040_home_network.down,
    name: '20261011_071040_home_network'
  },
];
