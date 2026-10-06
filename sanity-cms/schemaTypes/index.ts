import {headlineType} from './blocks/headline'
import {linkButtonType} from './blocks/linkButton'
import {responsiveImageType} from './blocks/responsiveImage'
import {richTextType} from './blocks/richText'
import {experienceType} from './documents/experience'
import {metricType} from './documents/metric'
import {pageType} from './documents/page'
import {pieceType} from './documents/piece'
import {projectType} from './documents/project'
import {roadType} from './documents/road'
import {siteSettingsType} from './documents/siteSettings'
import {skillType} from './documents/skill'
import {technologyType} from './documents/technology'
import {sectionTypes} from './sections/sectionTypes'

export const schemaTypes = [
  // Blocks
  richTextType,
  headlineType,
  responsiveImageType,
  linkButtonType,
  // Documents
  siteSettingsType,
  pageType,
  projectType,
  experienceType,
  skillType,
  pieceType,
  roadType,
  metricType,
  technologyType,
  // Sections
  ...sectionTypes,
]

/** Documents that exist once, under a fixed ID equal to their type name. */
export const singletonTypes = new Set(['siteSettings'])
