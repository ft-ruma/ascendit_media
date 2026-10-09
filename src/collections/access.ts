import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor' | 'pricing'

type WithRoles = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: WithRoles, ...roles: Role[]) =>
  !!user?.roles?.some((r) => r === 'admin' || roles.includes(r))

export const anyone: Access = () => true
export const loggedIn: Access = ({ req }) => !!req.user
export const admins: Access = ({ req }) => hasRole(req.user as WithRoles, 'admin')
export const editors: Access = ({ req }) => hasRole(req.user as WithRoles, 'editor')
export const pricingEditors: Access = ({ req }) => hasRole(req.user as WithRoles, 'pricing')

/** Public reads see published docs only; signed-in editors also see drafts. */
export const publishedOrSignedIn: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

export const pricingField: FieldAccess = ({ req }) => hasRole(req.user as WithRoles, 'pricing')
export const editorField: FieldAccess = ({ req }) => hasRole(req.user as WithRoles, 'editor')
