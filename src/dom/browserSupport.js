import getVendorPrefixedName from './getVendorPrefixedName'

export const hasCSSAnimations = () => !!getVendorPrefixedName('animationName')
export const hasCSSTransitions = () => !!getVendorPrefixedName('transition')
export const hasCSSTransforms = () => !!getVendorPrefixedName('transform')
export const hasCSS3DTransforms = () => !!getVendorPrefixedName('perspective')
