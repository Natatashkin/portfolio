import {useFormValue} from 'sanity'
import type {FieldProps} from 'sanity'

type ConditionalDescriptionProps = FieldProps & {
  conditionField: string
  descriptions: Record<string, string>
}

export function ConditionalDescription({
  conditionField,
  descriptions,
  ...props
}: ConditionalDescriptionProps) {
  const parentPath = props.path.slice(0, -1)

  const conditionValue = useFormValue([...parentPath, conditionField]) as string | undefined

  return props.renderDefault({
    ...props,
    description: conditionValue ? descriptions[conditionValue] : undefined,
  })
}
