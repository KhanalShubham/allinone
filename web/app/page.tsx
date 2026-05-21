import ToolCard from '@/components/ui/ToolCard';
import ToolIcon from '@/components/ui/ToolIcon';
import { categories } from '@/lib/tools';

export default function Home() {
  const totalAvailable = categories.flatMap((c) => c.tools).filter((t) => t.available).length;

  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Free Online Tools
            <br />
            <span className="text-blue-600">for Everyone</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            No sign-up. No downloads. Just open a tool and get your work done in seconds.
          </p>

          {/* Category chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white hover:shadow-sm hover:border-gray-300 transition-all text-gray-600 hover:text-gray-900"
              >
                <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                  <ToolIcon name={cat.icon} size={12} className="text-white" />
                </span>
                {cat.name}
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs text-gray-400">{totalAvailable} tools ready · more launching soon</p>
        </div>
      </section>

      {/* Tool sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {categories.map((category) => {
          const ready = category.tools.filter((t) => t.available).length;
          return (
            <section key={category.id} id={category.id}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-md`}>
                  <ToolIcon name={category.icon} size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                  <p className="text-xs text-gray-400">
                    {ready > 0 ? `${ready} ready to use` : 'Coming soon'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {category.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} category={category} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
