import {careerSectionType} from './careerSection'
import {ctaSectionType} from './ctaSection'
import {experienceSectionType} from './experienceSection'
import {heroSectionType} from './heroSection'
import {playgroundSectionType} from './playgroundSection'
import {projectsSectionType} from './projectsSection'
import {techStackSectionType} from './techStackSection'
import {whatIDoSectionType} from './whatIDoSection'

// Order used by the page's insert menu; each type needs a tile in static/sections/<name>.svg.
export const sectionTypes = [
  heroSectionType,
  careerSectionType,
  whatIDoSectionType,
  playgroundSectionType,
  projectsSectionType,
  experienceSectionType,
  techStackSectionType,
  ctaSectionType,
]
