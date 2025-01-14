import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import 'katex/dist/katex.min.css';
import BlockMath from "@matejmazur/react-katex";
import InlineMath from "@matejmazur/react-katex";
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
import { Textarea } from "@/components/ui/textarea";
import { X, FileImage } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  { 
    label: "Non-Verbal Reasoning", 
    subCategories: ["Pattern Series", "Figure Analysis", "Mirror Images", "Paper Folding", "Cube Construction", "Figure Matrix", "Analogy"],
    questionTypes: ["pattern_matching", "spatial_reasoning", "sequence", "image_based"]
  },
  { 
    label: "Verbal Reasoning", 
    subCategories: ["Word Relationships", "Sentence Completion", "Logical Deduction", "Sequence Detection", "Coding-Decoding", "Blood Relations"],
    questionTypes: ["text", "sequence"]
  },
  { 
    label: "English", 
    subCategories: ["Grammar", "Comprehension", "Vocabulary", "Writing"],
    questionTypes: ["text"]
  },
  { 
    label: "Mathematics", 
    subCategories: ["Algebra", "Geometry", "Arithmetic", "Statistics", "Calculus"],
    questionTypes: ["math_formula", "diagram", "mixed"]
  }
];

const questionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["Non-Verbal Reasoning", "Verbal Reasoning", "English", "Mathematics"]),
  subCategory: z.string().min(1, "Sub-category is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionType: z.enum([
    "text", "math_formula", "image_based", "diagram",
    "pattern_matching", "spatial_reasoning", "sequence", "mixed"
  ]),
  content_type: z.object({
    hasFormula: z.boolean(),
    hasImage: z.boolean(),
    hasPattern: z.boolean(),
    hasDiagram: z.boolean()
  }),
  options: z.array(z.object({
    text: z.string(),
    formula: z.string().optional(),
    image: z.string().optional(),
    pattern: z.string().optional(),
  })).min(2, "At least two options are required"),
  correctAnswer: z.number().min(0, "Correct answer is required"),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionEditorProps {
  open: boolean;
  onClose: () => void;
  editingQuestion?: QuestionFormValues & { id?: number };
}

export function QuestionEditor({ open, onClose, editingQuestion }: QuestionEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewFormula, setPreviewFormula] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<string>("text");

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: editingQuestion || {
      title: "",
      content: "",
      category: "Non-Verbal Reasoning",
      subCategory: "",
      difficulty: "medium",
      questionType: "text",
      content_type: {
        hasFormula: false,
        hasImage: false,
        hasPattern: false,
        hasDiagram: false
      },
      options: [
        { text: "", formula: "", image: "", pattern: "" },
        { text: "", formula: "", image: "", pattern: "" },
        { text: "", formula: "", image: "", pattern: "" },
        { text: "", formula: "", image: "", pattern: "" },
      ],
      correctAnswer: 0,
      explanation: "",
      hints: [],
      metadata: {},
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setPreviewFormula("");
      setSelectedCategory(null);
      setQuestionType("text");
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
        editingQuestion?.id ? `/api/questions/${editingQuestion.id}` : "/api/questions",
        {
          method: editingQuestion?.id ? "PUT" : "POST",
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
        title: `Question ${editingQuestion ? "updated" : "created"} successfully`,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{editingQuestion ? "Edit Question" : "Add Question"}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutateAsync(data))} className="space-y-4">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Question Content</TabsTrigger>
                <TabsTrigger value="options">Answer Options</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCategory(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.label} value={cat.label}>
                                {cat.label}
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
                    name="subCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedCategory}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Sub-Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory &&
                              categories
                                .find((cat) => cat.label === selectedCategory)
                                ?.subCategories.map((sub) => (
                                  <SelectItem key={sub} value={sub}>
                                    {sub}
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
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="content">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter a clear, concise title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Content</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter the question content"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="questionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setQuestionType(value);
                            // Update content_type based on question type
                            form.setValue("content_type", {
                              hasFormula: value === "math_formula" || value === "mixed",
                              hasImage: value === "image_based" || value === "mixed" || value === "diagram" || value === "pattern_matching" || value === "spatial_reasoning",
                              hasPattern: value === "pattern_matching",
                              hasDiagram: value === "diagram" || value === "mixed"
                            });
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Question Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory &&
                              categories
                                .find((cat) => cat.label === selectedCategory)
                                ?.questionTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(questionType === "math_formula" || questionType === "mixed") && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mathematical Formula (LaTeX)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Textarea
                                  {...field}
                                  placeholder="Enter LaTeX formula (e.g., \frac{d}{dx}x^2 = 2x)"
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setPreviewFormula(e.target.value);
                                  }}
                                />
                                {previewFormula && (
                                  <Card className="p-4">
                                    <CardContent>
                                      <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                                      <BlockMath math={previewFormula} />
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {(questionType === "image_based" || 
                    questionType === "diagram" || 
                    questionType === "pattern_matching" || 
                    questionType === "spatial_reasoning" || 
                    questionType === "mixed") && (
                    <FormField
                      control={form.control}
                      name="metadata.images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Images</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const url = await handleImageUpload(file);
                                        const currentImages = field.value || [];
                                        field.onChange([...currentImages, url]);
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
                              </div>
                              {field.value && field.value.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                  {field.value.map((url: string, index: number) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={url}
                                        alt={`Question image ${index + 1}`}
                                        className="w-full h-40 object-cover rounded-md"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                          const newImages = field.value.filter((_: string, i: number) => i !== index);
                                          field.onChange(newImages);
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="options">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Answer Options</h3>
                  {["A", "B", "C", "D"].map((option, index) => (
                    <div key={option} className="space-y-4 p-4 border rounded-lg">
                      <h4 className="font-medium">Option {option}</h4>

                      <FormField
                        control={form.control}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Option Text</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={`Enter Option ${option}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(questionType === "math_formula" || questionType === "mixed") && (
                        <FormField
                          control={form.control}
                          name={`options.${index}.formula`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Option Formula (LaTeX)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input
                                    {...field}
                                    placeholder="Enter LaTeX formula"
                                  />
                                  {field.value && (
                                    <div className="p-2 bg-muted rounded-md">
                                      <InlineMath math={field.value} />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {(questionType === "image_based" || 
                        questionType === "pattern_matching" || 
                        questionType === "spatial_reasoning" || 
                        questionType === "mixed") && (
                        <FormField
                          control={form.control}
                          name={`options.${index}.image`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Option Image</FormLabel>
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
                                {field.value && (
                                  <img
                                    src={field.value}
                                    alt={`Option ${option}`}
                                    className="mt-2 max-h-32 object-contain rounded-md"
                                  />
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="additional">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
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
                          <Textarea
                            {...field}
                            placeholder="Explain the correct answer"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "Saving..." : "Save Question"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}