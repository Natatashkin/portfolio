import {defineArrayMember, defineType} from 'sanity'

export const richTextType = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {
          title: 'Normal',
          value: 'normal',
        },
      ],
      lists: [
        {
          title: 'Bullet',
          value: 'bullet',
        },
      ],
      marks: {
        decorators: [
          {
            title: 'Strong',
            value: 'strong',
          },
          {
            title: 'Emphasis',
            value: 'em',
          },
        ],
        annotations: [
          {
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              {
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) => rule.required().uri({scheme: ['https', 'mailto', 'tel']}),
              },
            ],
          },
        ],
      },
    }),
  ],
})
