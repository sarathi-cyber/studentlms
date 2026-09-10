import Link from "next/link";

const courses = [
  {
    title: "C Programming Master Class",
    level: "Beginner",
    description:
      "Build a strong foundation in C programming through structured lessons, practical coding, and hands-on problem solving.",
    duration: "20 Hours",
    status: "Available",
  },
  {
    title: "Programming Fundamentals",
    level: "Beginner",
    description:
      "Understand programming logic, algorithms, problem solving, variables, conditions, loops, functions, and more.",
    duration: "Coming Soon",
    status: "Coming Soon",
  },
  {
    title: "Advanced Programming",
    level: "Intermediate",
    description:
      "Develop stronger programming skills through data structures, algorithms, projects, and practical challenges.",
    duration: "Coming Soon",
    status: "Coming Soon",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#d4af37]/10 bg-[#050505]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link href="/" className="group">
            <div className="text-xl font-bold tracking-[0.2em] text-[#d4af37]">
              TECHVORA
            </div>
            <div className="text-[9px] tracking-[0.35em] text-zinc-500">
              ACADEMY
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#courses" className="text-sm text-zinc-400 transition hover:text-[#d4af37]">
              Courses
            </a>
            <a href="#about" className="text-sm text-zinc-400 transition hover:text-[#d4af37]">
              About
            </a>
            <a href="#leadership" className="text-sm text-zinc-400 transition hover:text-[#d4af37]">
              Leadership
            </a>
            <a href="#instructor" className="text-sm text-zinc-400 transition hover:text-[#d4af37]">
              Instructor
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/student/login"
              className="hidden rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-medium text-[#d4af37] transition hover:bg-[#d4af37]/10 sm:block"
            >
              Student Login
            </Link>

            <Link
              href="/admin/login"
              className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f1d77a]"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center sm:py-36">

          <div className="mb-6 text-sm font-semibold tracking-[0.45em] text-[#d4af37]">
            TECHVORA ACADEMY
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-bold leading-tight sm:text-7xl">
            Learn.
            <span className="text-[#d4af37]"> Practice.</span>
            <br />
            Build.
            <span className="text-[#d4af37]"> Succeed.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            A technology-focused learning platform designed to help students
            develop programming skills through structured education,
            practical learning, and real-world projects.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/student/register"
              className="rounded-lg bg-[#d4af37] px-7 py-3.5 font-semibold text-black transition hover:bg-[#f1d77a]"
            >
              Start Learning
            </Link>

            <a
              href="#courses"
              className="rounded-lg border border-zinc-700 px-7 py-3.5 font-semibold text-white transition hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              Explore Courses
            </a>
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="mb-14 text-center">
            <div className="text-sm font-semibold tracking-[0.3em] text-[#d4af37]">
              OUR COURSES
            </div>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Courses Offered
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
              Practical and structured courses designed to develop strong
              programming fundamentals and technical skills.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.title}
                className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-7 transition duration-300 hover:-translate-y-2 hover:border-[#d4af37]/50"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs text-[#d4af37]">
                    {course.level}
                  </span>

                  <span className="text-xs text-zinc-600">
                    {course.status}
                  </span>
                </div>

                <h3 className="mt-7 text-2xl font-bold text-white group-hover:text-[#d4af37]">
                  {course.title}
                </h3>

                <p className="mt-4 min-h-24 text-sm leading-6 text-zinc-400">
                  {course.description}
                </p>

                <div className="mt-7 border-t border-zinc-800 pt-5 text-sm text-zinc-500">
                  {course.duration}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-zinc-900 bg-[#080808]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center">

          <div>
            <div className="text-sm font-semibold tracking-[0.3em] text-[#d4af37]">
              ABOUT THE ACADEMY
            </div>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Building the next generation of technology learners.
            </h2>
          </div>

          <div className="space-y-5 text-zinc-400 leading-8">
            <p>
              Techvora Academy is an educational initiative focused on
              developing programming and technology skills among students.
            </p>

            <p>
              Our approach combines conceptual understanding with practical
              coding, exercises, projects, and continuous learning.
            </p>

            <p>
              We believe that technology education should not simply teach
              students what to write, but should teach them how to think,
              solve problems, and build meaningful solutions.
            </p>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section id="leadership" className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="mb-14 text-center">
            <div className="text-sm font-semibold tracking-[0.3em] text-[#d4af37]">
              LEADERSHIP
            </div>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              The People Behind Techvora
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">

            {/* FOUNDER */}
            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-2xl font-bold text-[#d4af37]">
                F
              </div>

              <div className="mt-7 text-xs font-semibold tracking-[0.25em] text-[#d4af37]">
                FOUNDER
              </div>

              <h3 className="mt-2 text-3xl font-bold">
                Founder Name
              </h3>

              <p className="mt-5 leading-7 text-zinc-400">
                Founder biography will be added here with the official
                professional background, vision, achievements, and the
                motivation behind Techvora Academy.
              </p>
            </article>

            {/* CEO */}
            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-2xl font-bold text-[#d4af37]">
                C
              </div>

              <div className="mt-7 text-xs font-semibold tracking-[0.25em] text-[#d4af37]">
                CHIEF EXECUTIVE OFFICER
              </div>

              <h3 className="mt-2 text-3xl font-bold">
                CEO Name
              </h3>

              <p className="mt-5 leading-7 text-zinc-400">
                CEO biography will be added here with the official
                professional background, responsibilities, vision, and
                contribution to Techvora Academy.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section id="instructor" className="border-t border-zinc-900 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-semibold tracking-[0.3em] text-[#d4af37]">
              INSTRUCTOR
            </div>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Learn From Practitioners
            </h2>

            <p className="mt-6 leading-8 text-zinc-400">
              Meet the instructor responsible for delivering practical,
              structured, and engaging technology education through Techvora
              Academy.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-3xl font-bold text-[#d4af37]">
              I
            </div>

            <div className="mt-7 text-xs font-semibold tracking-[0.25em] text-[#d4af37]">
              INSTRUCTOR
            </div>

            <h3 className="mt-2 text-3xl font-bold">
              Instructor Name
            </h3>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-400">
              Instructor profile and professional biography will be added
              here with the official teaching experience, technical
              expertise, achievements, and areas of specialization.
            </p>
          </div>
        </div>
      </section>

      {/* WHY TECHVORA */}
      <section className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">
            <div className="text-sm font-semibold tracking-[0.3em] text-[#d4af37]">
              WHY TECHVORA
            </div>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              More Than Just Classes
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Structured Learning", "Learn through carefully organized courses and progressive lessons."],
              ["02", "Practical Coding", "Apply concepts through exercises, challenges, and projects."],
              ["03", "Student Progress", "Track your learning journey through the LMS."],
              ["04", "Certification", "Complete eligible courses and earn certificates."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7"
              >
                <div className="text-sm font-bold text-[#d4af37]">
                  {number}
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#d4af37]/20 bg-[#d4af37]/5">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">

          <div className="text-sm font-semibold tracking-[0.3em] text-[#d4af37]">
            START YOUR JOURNEY
          </div>

          <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
            Ready to start learning?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-400">
            Join Techvora Academy and begin developing the skills needed to
            learn, build, and grow in technology.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/student/register"
              className="rounded-lg bg-[#d4af37] px-7 py-3.5 font-semibold text-black transition hover:bg-[#f1d77a]"
            >
              Create Student Account
            </Link>

            <Link
              href="/student/login"
              className="rounded-lg border border-zinc-700 px-7 py-3.5 font-semibold text-white transition hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="font-bold tracking-[0.2em] text-[#d4af37]">
              TECHVORA
            </div>
            <div className="mt-1 text-xs">
              Technology • Education • Innovation
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div>© {new Date().getFullYear()} Techvora Academy</div>
            <div className="mt-1">
              techvorasupport@gmail.com
            </div>
          </div>

        </div>
      </footer>

    </main>
  );
}
