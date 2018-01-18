﻿import { types } from 'mobx-state-tree';

const BreadcrumbItem = types.model('BreadcrumbItem', {
  title: types.string,
  url: types.string,
});

export const NavItem = types.model('NavItem', {
  id: types.identifier(types.string),
  text: types.string,
  url: types.optional(types.string, ''),
  subTitle: types.optional(types.string, ''),
  icon: types.optional(types.string, ''),
  img: types.optional(types.string, ''),
  active: types.optional(types.boolean, false),
  breadcrumbs: types.optional(types.array(types.late(() => Breadcrumb)), []),
  children: types.optional(types.array(types.late(() => NavItem)), []),
  breadcrumbs: types.optional(types.array(BreadcrumbItem), []),
});

export const Breadcrumb = types.model('Breadcrumb', {
  title: types.string,
  url: types.string,
});
