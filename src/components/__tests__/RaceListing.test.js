import { describe, test, beforeEach, afterEach } from '@jest/globals';
import moment from 'moment';
import React from 'react';
import { shallow } from 'enzyme';
import MockDate from 'mockdate';

import RaceListing from '../RaceListing';
import { defaultFilters } from '../../reducers/settings';

import '../../data/season.json';

jest.mock('../../data/season.json');

describe('components/RaceListing', () => {
  const defaultProps = {
    date: moment('2020-09-23T01:00:00.000Z'),
    sort: { key: 'id', order: 'asc' },
    filters: defaultFilters,
    favouriteSeries: [],
    ownedTracks: [],
    ownedCars: [],
    favouriteCars: [],
    favouriteTracks: [],
    columnIds: ['id'],
    updateSort: () => {},
  };

  beforeEach(() => {
    MockDate.set('2020-09-23T13:30:00.000Z');
  });

  afterEach(() => {
    MockDate.reset();
  });

  test('renders correctly', () => {
    const component = shallow(<RaceListing
      {...defaultProps}
    />);

    expect(component).toMatchSnapshot();

    component.find({ id: 'raceListing-th-id' }).first().simulate('click');
  });

  test('changes sort on click', () => {
    const sort = jest.fn();
    const component = shallow(<RaceListing
      {...defaultProps}
      sort={{ key: 'id', order: 'asc' }}
      columnIds={['id', 'series']}
      updateSort={sort}
    />);

    expect(component).toMatchSnapshot();

    component.find({ id: 'raceListing-th-id' }).first().simulate('click');
    expect(sort).toBeCalledWith({ key: 'id', order: 'desc' });

    sort.mockClear();

    component.find({ id: 'raceListing-th-series' }).first().simulate('click');
    expect(sort).toBeCalledWith({ key: 'series', order: 'asc' });

    const newSort = jest.fn();
    const componentDesc = shallow(<RaceListing
      {...defaultProps}
      sort={{ key: 'series', order: 'desc' }}
      columnIds={['id', 'series', 'raceTimes']}
      updateSort={newSort}
    />);

    expect(componentDesc).toMatchSnapshot();

    componentDesc.find({ id: 'raceListing-th-series' }).first().simulate('click');
    expect(newSort).toBeCalledWith({ key: 'series', order: 'asc' });

    newSort.mockClear();

    componentDesc.find({ id: 'raceListing-th-raceTimes' }).first().simulate('click');
    expect(newSort).not.toBeCalled();
  });

  test('renders not found favourite series', () => {
    const component = shallow(<RaceListing
      {...defaultProps}
      filters={{ ...defaultFilters, favouriteSeries: true }}
      favouriteSeries={[543]}
    />);

    expect(component).toMatchSnapshot();
    expect(component.find('table').length).toBe(0);
  });

  test('renders not found favourite cars', () => {
    const component = shallow(<RaceListing
      {...defaultProps}
      filters={{ ...defaultFilters, favouriteCarsOnly: true }}
      favouriteCars={[9999]}
    />);

    expect(component).toMatchSnapshot();
    expect(component.find('table').length).toBe(0);
  });

  test('renders not found favourite tracks', () => {
    const component = shallow(<RaceListing
      {...defaultProps}
      filters={{ ...defaultFilters, favouriteTracksOnly: true }}
      favouriteTracks={[9999]}
    />);

    expect(component).toMatchSnapshot();
    expect(component.find('table').length).toBe(0);
  });
});
