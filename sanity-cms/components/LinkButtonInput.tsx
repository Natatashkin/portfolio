import {useCallback} from 'react'
import {
  isBooleanInputProps,
  type ObjectInputProps,
  PatchEvent,
  type RenderInputCallback,
  set,
} from 'sanity'

export type LinkButtonValue = {
  _type?: string
  isExternal?: boolean
  url?: string
  page?: unknown
  anchor?: string
}

// Two adjustments to this button's own boolean fields:
// - An unset boolean is shown as `false` (not the "indeterminate" state) without writing anything;
//   older buttons and the singleton have no stored value, and the site treats `undefined` as `false`.
// - Hidden fields keep their values in Sanity. When "External link" is clicked, the toggle and the
//   removal of the other link type's fields go out as one patch: one transaction, one undo step,
//   and nothing happens on history views, discards, restores or collaborators' edits.
//   Not yet verified in Studio: see the "Known issue (to verify)" entry in docs/landing-plan.md.
export function LinkButtonInput(props: ObjectInputProps<LinkButtonValue>) {
  const {onChange, path, renderInput, schemaType, value} = props

  const renderMemberInput = useCallback<RenderInputCallback>(
    (inputProps) => {
      const isOwnBoolean =
        isBooleanInputProps(inputProps) && inputProps.path.length === path.length + 1
      if (!isOwnBoolean) return renderInput(inputProps)

      const booleanProps = {
        ...inputProps,
        value: inputProps.value ?? false,
      }
      if (inputProps.path.at(-1) !== 'isExternal') return renderInput(booleanProps)

      return renderInput({
        ...booleanProps,
        onChange: (patch) => {
          const setPatch = PatchEvent.from(patch).patches.find(({type}) => type === 'set')
          const next = setPatch?.type === 'set' && setPatch.value === true
          // Replace the whole button in one `set`, leaving out the other link type's fields.
          // Separate `unset` patches did not reliably clear text fields.
          const {url, page, anchor, ...rest} = value ?? {}
          onChange(
            set({
              ...rest,
              _type: schemaType.name,
              isExternal: next,
              ...(next ? {url} : {page, anchor}),
            }),
          )
        },
      })
    },
    [onChange, path.length, renderInput, schemaType.name, value],
  )

  return props.renderDefault({
    ...props,
    renderInput: renderMemberInput,
  })
}
