import React from 'react';
import { shallow } from 'enzyme';
import { UsersListPage, Props } from './UsersListPage';
import { NavModel, User } from 'app/types';
import { getMockUser } from './__mocks__/userMocks';
import appEvents from '../../core/app_events';

jest.mock('../../core/app_events', () => ({
  emit: jest.fn(),
}));

const setup = (propOverrides?: object) => {
  const props: Props = {
    navModel: {} as NavModel,
    users: [] as User[],
    searchQuery: '',
    loadUsers: jest.fn(),
    updateUser: jest.fn(),
    removeUser: jest.fn(),
    setUsersSearchQuery: jest.fn(),
  };

  Object.assign(props, propOverrides);

  const wrapper = shallow(<UsersListPage {...props} />);
  const instance = wrapper.instance() as UsersListPage;

  return {
    wrapper,
    instance,
  };
};

describe('Render', () => {
  it('should render component', () => {
    const { wrapper } = setup();

    expect(wrapper).toMatchSnapshot();
  });
});

describe('Functions', () => {
  it('should emit show remove user modal', () => {
    const { instance } = setup();
    const mockUser = getMockUser();

    instance.onRemoveUser(mockUser);

    expect(appEvents.emit).toHaveBeenCalled();
  });
});
