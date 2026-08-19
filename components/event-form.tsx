"use client";

// 이벤트 생성/수정 페이지가 공유하는 폼 컴포넌트.
// Phase 2(더미 데이터 단계) 제약에 따라 실제 Supabase 저장은 하지 않고 클라이언트 검증까지만 다룸 —
// onSubmit 내부는 Task 009(이벤트 CRUD 및 초대 시스템)에서 Server Action 호출로 교체될 예정.

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { eventFormSchema, type EventFormValues } from "@/lib/schemas/event";

const EMPTY_DEFAULT_VALUES: EventFormValues = {
  title: "",
  location: "",
  eventDate: "",
  description: "",
  coverImageUrl: "",
};

export interface EventFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<EventFormValues>;
}

export function EventForm({ mode, defaultValues }: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { ...EMPTY_DEFAULT_VALUES, ...defaultValues },
  });

  function onSubmit(values: EventFormValues) {
    console.log("이벤트 폼 제출값(더미, 실제 저장 없음)", values);
    toast.success(mode === "create" ? "이벤트가 생성되었습니다" : "이벤트가 수정되었습니다");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "이벤트 만들기" : "이벤트 수정"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="예) 2026 신년 모임" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소</FormLabel>
                  <FormControl>
                    <Input placeholder="예) 강남 스터디카페" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>날짜 및 시간</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 (선택)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="이벤트에 대한 설명을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>커버 이미지 URL (선택)</FormLabel>
                  <FormControl>
                    <Input placeholder="추후 이미지 업로드 기능이 연동될 예정입니다" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {mode === "create" ? "이벤트 만들기" : "저장"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
