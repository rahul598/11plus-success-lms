import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Upload } from "lucide-react";

const questionSchema = z.object({
  id: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  quizName: z.string().min(1, "Quiz name is required"),
  questionType: z.enum(["Text Only", "True/False", "Images"]),
  questionTitle: z.string().min(1, "Question title is required"),
  questionImage: z.string().optional(),
  optionType: z.enum(["Text Only", "Images"]).optional(),
  options: z.array(z.string()).min(2, "At least two options are required"),
  optionImages: z.array(z.string()).optional(),
  correctAnswer: z.number().min(0, "Correct answer is required"),
  explanation: z.string().optional(),
  createdAt: z.date().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionEditorProps {
  open: boolean;
  onClose: () => void;
}

const categories = [
  "Mathematics",
  "Science",
  "History",
  "Literature",
  "Computer Science",
  "Languages",
];

const quizNames = ["Quiz 1", "Quiz 2", "Quiz 3", "New Quiz"]; // This should be fetched from API

export function QuestionEditor({ open, onClose }: QuestionEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionType, setQuestionType] = useState<"Text Only" | "True/False" | "Images">("Text Only");
  const [optionType, setOptionType] = useState<"Text Only" | "Images">("Text Only");

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      category: "",
      quizName: "",
      questionType: "Text Only",
      questionTitle: "",
      questionImage: "",
      optionType: "Text Only",
      options: ["", "", "", ""],
      optionImages: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setQuestionType("Text Only");
      setOptionType("Text Only");
    }
  }, [open, form]);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const mutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      const response = await fetch(
        data.id ? `/api/questions/${data.id}` : "/api/questions",
        {
          method: data.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Question created successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onSubmit = async (data: QuestionFormValues) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Add Question</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quizName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Name</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Quiz Name" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {quizNames.map((quiz) => (
                          <SelectItem key={quiz} value={quiz}>
                            {quiz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Question Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: "Text Only" | "True/False" | "Images") => {
                        field.onChange(value);
                        setQuestionType(value);
                        if (value === "Images") {
                          setOptionType("Images");
                        }
                      }}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Text Only" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Text Only
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="True/False" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          True/False
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Images" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Images
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Question" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {questionType === "Images" && (
              <FormField
                control={form.control}
                name="questionImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await handleImageUpload(file);
                                field.onChange(url);
                              } catch (error) {
                                toast({
                                  variant: "destructive",
                                  title: "Error uploading image",
                                  description: "Please try again",
                                });
                              }
                            }
                          }}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => field.onChange("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {questionType !== "True/False" && (
              <FormField
                control={form.control}
                name="optionType"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Option Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value: "Text Only" | "Images") => {
                          field.onChange(value);
                          setOptionType(value);
                        }}
                        value={optionType}
                        className="flex space-x-4"
                        disabled={questionType === "Images"}
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Text Only" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Text Only
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Images" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Images
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {["A", "B", "C", "D"].map((option, index) => (
              <div key={option} className="space-y-4">
                <FormField
                  control={form.control}
                  name={`options.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option {option}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={`Enter Option ${option}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {optionType === "Images" && (
                  <FormField
                    control={form.control}
                    name={`optionImages.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option {option} Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await handleImageUpload(file);
                                    const images = form.getValues("optionImages") || [];
                                    images[index] = url;
                                    form.setValue("optionImages", images);
                                  } catch (error) {
                                    toast({
                                      variant: "destructive",
                                      title: "Error uploading image",
                                      description: "Please try again",
                                    });
                                  }
                                }
                              }}
                            />
                            {field.value && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const images = form.getValues("optionImages") || [];
                                  images[index] = "";
                                  form.setValue("optionImages", images);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            ))}

            <FormField
              control={form.control}
              name="correctAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Correct Answer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((option, index) => (
                        <SelectItem key={option} value={index.toString()}>
                          Option {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation (Optional)</FormLabel>
                  <FormControl>
                    <div className="border rounded-md p-4">
                      <Input
                        {...field}
                        placeholder="Your text here..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center">
              <Button type="submit" disabled={isSubmitting} className="w-full max-w-md">
                {isSubmitting ? "Uploading..." : "Upload Question"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}