import { z } from 'zod';


/**
 * Chat Completion API - Request
 * https://github.com/jmorganca/ollama/blob/main/docs/api.md#generate-a-chat-completion
 */
const wireOllamaChatCompletionInputSchema = z.object({

  // required
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(['assistant', 'system', 'user']),
    content: z.string(),
  })),

  // optional
  format: z.enum(['json']).optional(),
  options: z.object({
    // https://github.com/jmorganca/ollama/blob/main/docs/modelfile.md
    // Maximum number of tokens to predict when generating text.
    num_predict: z.number().int().optional(),
    // Sets the random number seed to use for generation
    seed: z.number().int().optional(),
    // The temperature of the model
    temperature: z.number().positive().optional(),
    // Reduces the probability of generating nonsense (Default: 40)
    top_k: z.number().positive().optional(),
    // Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text. (Default 0.9)
    top_p: z.number().positive().optional(),
  }).optional(),
  template: z.string().optional(), // overrides what is defined in the Modelfile
  stream: z.boolean().optional(), // default: true

  // Future Improvements?
  // n: z.number().int().optional(), // number of completions to generate
  // functions: ...
  // function_call: ...
});
export type WireOllamaChatCompletionInput = z.infer<typeof wireOllamaChatCompletionInputSchema>;


/**
 * Chat Completion or Generation APIs - Streaming Response
 */
export const wireOllamaChunkedOutputSchema = z.object({
  model: z.string(),
  // created_at: z.string(), // commented because unused

  // [Chat Completion] (exclusive with 'response')
  message: z.object({
    role: z.enum(['assistant' /*, 'system', 'user' Disabled on purpose, to validate the response */]),
    content: z.string(),
  }).optional(), // optional on the last message

  // [Generation] (non-chat, exclusive with 'message')
  //response: z.string().optional(),

  done: z.boolean(),

  // only on the last message
  // context: z.array(z.number()), // non-chat endpoint
  // total_duration: z.number(),
  // prompt_eval_count: z.number(),
  // prompt_eval_duration: z.number(),
  // eval_count: z.number(),
  // eval_duration: z.number(),

});