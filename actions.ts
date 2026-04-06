"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const priority = formData.get("priority") as string;
  if (!title) return;
  await prisma.task.create({
    data: {
      title,
      priority: priority.replace("Priority: ", "").toUpperCase(),
      status: "PENDING",
    },
  });
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function addExpense(formData: FormData) {
  const amountStr = formData.get("amount") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  if (!amountStr || !description) return;
  await prisma.expense.create({
    data: {
      amount: parseFloat(amountStr),
      category,
      description,
    },
  });
  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function addNote(content: string) {
  if (!content) return;
  await prisma.note.create({
    data: { content },
  });
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function addEvent(formData: FormData) {
  const title = formData.get("title") as string;
  const time = formData.get("time") as string;
  const date = formData.get("date") as string;
  if (!title) return;
  await prisma.event.create({
    data: { title, time: `${date} ${time}`, status: "SCHEDULED" },
  });
  revalidatePath("/calendar");
  revalidatePath("/");
}
