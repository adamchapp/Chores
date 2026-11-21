import { xpToNextLevel } from "@chores/domain";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">Chores</h1>
      <p>Turn household chores into a family adventure.</p>
      <p className="text-sm text-slate-500">
        Coming soon. Your first level-up needs {xpToNextLevel(1)} XP.
      </p>
    </main>
  );
}
