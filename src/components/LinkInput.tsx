import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { object, string, parse } from 'valibot'
import * as Form from '@radix-ui/react-form'
import { Button, Flex, Text } from '@radix-ui/themes'
import { Link1Icon } from '@radix-ui/react-icons'
import type { ProcessedContent } from '../services/linkProcessor'

const urlSchema = object({
  url: string()
})

type FormData = {
  url: string
}

interface Props {
  onProcessed?: (result: ProcessedContent) => void
  onError?: (error: Error) => void
}

export function LinkInput({ onProcessed, onError }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      setIsProcessing(true)
      const validatedData = parse(urlSchema, data)
      
      // Validate URL format
      try {
        new URL(validatedData.url)
      } catch {
        throw new Error('Please enter a valid URL')
      }

      // Process the URL via API
      const response = await fetch('/api/linkProcessor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: validatedData.url })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to process URL')
      }

      onProcessed?.(responseData)
    } catch (error) {
      console.error('Error processing URL:', error)
      onError?.(error instanceof Error ? error : new Error('Failed to process URL'))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Form.Root onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="3">
        <Form.Field name="url">
          <Form.Control asChild>
            <input
              type="url"
              placeholder="Enter URL to process"
              {...register('url', { 
                required: 'URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
            />
          </Form.Control>
          {errors.url && (
            <Text color="red" size="2">
              {errors.url.message}
            </Text>
          )}
        </Form.Field>

        <Button size="3" disabled={isProcessing}>
          <Link1Icon />
          {isProcessing ? 'Processing...' : 'Process URL'}
        </Button>
      </Flex>
    </Form.Root>
  )
}
