import { useState } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDownIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
  AppNavItem,
  AppNavLeaf,
  appNavItems,
  isNavItemActive,
} from "./navigation";

const AppSidebar: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [openGroupKeys, setOpenGroupKeys] = useState<string[]>([]);

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isItemActive = (item: AppNavItem) => isNavItemActive(item, isActive);

  const toggleIndex = (index: number) => {
    setOpenIndexes((current) => {
      const isClosing = current.includes(index);

      if (isClosing) {
        setOpenGroupKeys((keys) =>
          keys.filter((key) => !key.startsWith(`${index}:`)),
        );
        return current.filter((item) => item !== index);
      }

      return [...current, index];
    });
  };

  const toggleGroupKey = (groupKey: string) => {
    setOpenGroupKeys((current) =>
      current.includes(groupKey)
        ? current.filter((key) => key !== groupKey)
        : [...current, groupKey],
    );
  };

  const renderLeafItems = (
    items: AppNavLeaf[] | undefined,
    parentKey: string,
    depth = 0,
  ) => {
    if (!items?.length) {
      return null;
    }

    return (
      <div className={depth === 0 ? "space-y-1" : "mt-1 space-y-1 pl-3"}>
        {items.map((leaf) => {
          const leafKey = `${parentKey}:${leaf.name}`;
          const hasChildren = Boolean(leaf.items?.length);

          if (!hasChildren && leaf.path) {
            return (
              <Link
                key={leaf.path}
                to={leaf.path}
                onClick={toggleMobileSidebar}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  isActive(leaf.path)
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                    : "text-gray-700 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {leaf.name}
              </Link>
            );
          }

          return (
            <div key={leafKey} className="rounded-lg bg-gray-50 p-1 dark:bg-gray-800/60">
              <button
                type="button"
                onClick={() => toggleGroupKey(leafKey)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-medium text-gray-800 transition hover:bg-white dark:text-white/90 dark:hover:bg-gray-700"
              >
                <span>{leaf.name}</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    openGroupKeys.includes(leafKey) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openGroupKeys.includes(leafKey)
                ? renderLeafItems(leaf.items, leafKey, depth + 1)
                : null}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:hidden ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between py-8">
        <Link to="/" onClick={toggleMobileSidebar}>
          <h1 className="text-3xl text-gray-800 dark:text-gray-300">Cliq</h1>
        </Link>
        <button
          onClick={toggleMobileSidebar}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto">
        <nav className="mb-6">
          <h2 className="mb-4 text-xs uppercase leading-[20px] text-gray-400">
            Menu
          </h2>
          <ul className="flex flex-col gap-2">
            {appNavItems.map((item, index) => (
              <li key={item.name}>
                {item.path ? (
                  <Link
                    to={item.path}
                    onClick={toggleMobileSidebar}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => toggleIndex(index)}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium ${
                        isItemActive(item)
                          ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.name}
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${openIndexes.includes(index) ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openIndexes.includes(index) ? (
                      <div className="space-y-1 border-t border-gray-100 p-2 dark:border-gray-800">
                        {item.groups?.map((group) => (
                          <div key={group.name}>
                            {group.path ? (
                              <Link
                                to={group.path}
                                onClick={toggleMobileSidebar}
                                className={`block rounded-lg px-3 py-2 text-sm transition ${
                                  isActive(group.path)
                                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                }`}
                              >
                                {group.name}
                              </Link>
                            ) : item.name === "Operations" || item.name === "Reports" ? (
                              <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800/60">
                                <button
                                  type="button"
                                  onClick={() => toggleGroupKey(`${index}:${group.name}`)}
                                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-medium text-gray-800 transition hover:bg-white dark:text-white/90 dark:hover:bg-gray-700"
                                >
                                  <span>{group.name}</span>
                                  <ChevronDownIcon
                                    className={`h-4 w-4 transition-transform ${
                                      openGroupKeys.includes(`${index}:${group.name}`)
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>

                                {openGroupKeys.includes(`${index}:${group.name}`) ? (
                                  <div className="mt-2">
                                    {renderLeafItems(
                                      group.items,
                                      `${index}:${group.name}`,
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800/60">
                                <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  {group.name}
                                </p>
                                {renderLeafItems(
                                  group.items,
                                  `${index}:${group.name}`,
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
