import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import { useDropdownPosition } from "../hooks/useDropdownPosition";
import { ChevronDownIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
  AppNavGroup,
  AppNavItem,
  AppNavLeaf,
  appNavItems,
  isNavLeafActive,
  isNavItemActive,
} from "./navigation";

interface DesktopNavItemProps {
  index: number;
  item: AppNavItem;
  openDropdown: number | null;
  setOpenDropdown: Dispatch<SetStateAction<number | null>>;
  isPathActive: (path: string) => boolean;
  isItemActive: (item: AppNavItem) => boolean;
}

interface DesktopFlyoutLeafProps {
  leaf: AppNavLeaf;
  leafKey: string;
  parentKey: string;
  isOpen: boolean;
  isPathActive: (path: string) => boolean;
  onToggle: (parentKey: string, leafKey: string) => void;
  renderLeafItems: (
    items: AppNavLeaf[] | undefined,
    parentKey: string,
  ) => React.ReactNode;
}

function DesktopFlyoutLeaf({
  leaf,
  leafKey,
  parentKey,
  isOpen,
  isPathActive,
  onToggle,
  renderLeafItems,
}: DesktopFlyoutLeafProps) {
  const isLeafActive = isNavLeafActive(leaf, isPathActive);
  const { anchorRef, dropdownRef, dropdownStyle, isPositionReady } =
    useDropdownPosition({
      isOpen,
      preferredSide: "right",
      align: "start",
      offset: 8,
      viewportPadding: 16,
      strategy: "fixed",
    });

  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        onClick={() => onToggle(parentKey, leafKey)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
          isLeafActive
            ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
      >
        <span>{leaf.name}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-270" : "rotate-90"
          }`}
        />
      </button>

      {isOpen ? (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={`z-[60] w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900 ${
            isPositionReady ? "" : "pointer-events-none opacity-0"
          }`}
        >
          {renderLeafItems(leaf.items, leafKey)}
        </div>
      ) : null}
    </div>
  );
}

function DesktopNavItem({
  index,
  item,
  openDropdown,
  setOpenDropdown,
  isPathActive,
  isItemActive,
}: DesktopNavItemProps) {
  const isDropdownOpen = openDropdown === index;
  const { anchorRef, dropdownRef, dropdownStyle, isPositionReady } =
    useDropdownPosition({
      isOpen: Boolean(item.groups && isDropdownOpen),
      preferredSide: "bottom",
      align: "center",
      offset: 8,
      viewportPadding: 16,
    });
  const [openGroupIndexes, setOpenGroupIndexes] = useState<number[]>([]);
  const [openLeafKeys, setOpenLeafKeys] = useState<
    Record<string, string | null>
  >({});
  const isAccordionDropdown =
    item.name === "Operations" || item.name === "Reports";

  useEffect(() => {
    if (!isDropdownOpen) {
      setOpenGroupIndexes([]);
      setOpenLeafKeys({});
    }
  }, [isDropdownOpen]);

  const toggleGroupIndex = (groupIndex: number) => {
    setOpenGroupIndexes((current) =>
      current.includes(groupIndex)
        ? current.filter((value) => value !== groupIndex)
        : [...current, groupIndex],
    );
  };

  const toggleLeafKey = (parentKey: string, leafKey: string) => {
    setOpenLeafKeys((current) => ({
      ...current,
      [parentKey]: current[parentKey] === leafKey ? null : leafKey,
    }));
  };

  const renderLeafItems = (
    items: AppNavLeaf[] | undefined,
    parentKey: string,
  ) => {
    if (!items?.length) {
      return null;
    }

    return (
      <div className="space-y-1">
        {items.map((leaf) => {
          const leafKey = `${parentKey}:${leaf.name}`;
          const hasChildren = Boolean(leaf.items?.length);
          const isFlyoutOpen = openLeafKeys[parentKey] === leafKey;

          if (!hasChildren && leaf.path) {
            return (
              <Link
                key={leaf.path}
                to={leaf.path}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  isPathActive(leaf.path)
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {leaf.name}
              </Link>
            );
          }

          return (
            <DesktopFlyoutLeaf
              key={leafKey}
              leaf={leaf}
              leafKey={leafKey}
              parentKey={parentKey}
              isOpen={isFlyoutOpen}
              isPathActive={isPathActive}
              onToggle={toggleLeafKey}
              renderLeafItems={renderLeafItems}
            />
          );
        })}
      </div>
    );
  };

  const renderGroup = (group: AppNavGroup, groupIndex: number) => {
    if (group.path) {
      return (
        <Link
          to={group.path}
          className={`block px-4 py-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isPathActive(group.path)
              ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {group.name}
        </Link>
      );
    }

    if (isAccordionDropdown) {
      return (
        <div className="px-3 py-2">
          <button
            type="button"
            onClick={() => toggleGroupIndex(groupIndex)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-800 transition hover:bg-gray-100 dark:text-white/90 dark:hover:bg-gray-800"
          >
            <span>{group.name}</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${
                openGroupIndexes.includes(groupIndex) ? "rotate-180" : ""
              }`}
            />
          </button>

          {openGroupIndexes.includes(groupIndex) ? (
            <div className="mt-2 px-2 pb-1">
              {renderLeafItems(group.items, `group:${group.name}`)}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="px-4 py-3">
        <div className="mb-2 text-sm font-medium text-gray-900 dark:text-white/90">
          {group.name}
        </div>
        {renderLeafItems(group.items, `group:${group.name}`)}
      </div>
    );
  };

  return (
    <div ref={anchorRef} className="relative">
      {item.path ? (
        <Link
          to={item.path}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isPathActive(item.path)
              ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          {item.name}
        </Link>
      ) : (
        <button
          onClick={() => setOpenDropdown(isDropdownOpen ? null : index)}
          className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isDropdownOpen || isItemActive(item)
              ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          {item.name}
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {item.groups && isDropdownOpen ? (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={`custom-scrollbar absolute z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 ${
            isPositionReady ? "" : "pointer-events-none opacity-0"
          }`}
        >
          {item.groups.map((group, groupIndex) => (
            <div
              key={group.name}
              className="border-b border-gray-100 last:border-b-0 dark:border-gray-800"
            >
              {renderGroup(group, groupIndex)}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const { toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setApplicationMenuOpen(false);
  }, [location.pathname]);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const isPathActive = (path: string) =>
    path === "/"
      ? activePath === "/"
      : activePath === path || activePath.startsWith(`${path}/`);

  const isItemActive = (item: AppNavItem) =>
    isNavItemActive(item, isPathActive);

  return (
    <header className="sticky top-0 z-[999] w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMobileSidebar}
            className="rounded-lg p-2 hover:bg-gray-100 text-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open navigation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 6.75C3 6.33579 3.33579 6 3.75 6H20.25C20.6642 6 21 6.33579 21 6.75C21 7.16421 20.6642 7.5 20.25 7.5H3.75C3.33579 7.5 3 7.16421 3 6.75ZM3 12C3 11.5858 3.33579 11.25 3.75 11.25H20.25C20.6642 11.25 21 11.5858 21 12C21 12.4142 20.6642 12.75 20.25 12.75H3.75C3.33579 12.75 3 12.4142 3 12ZM3.75 16.5C3.33579 16.5 3 16.8358 3 17.25C3 17.6642 3.33579 18 3.75 18H12.75C13.1642 18 13.5 17.6642 13.5 17.25C13.5 16.8358 13.1642 16.5 12.75 16.5H3.75Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <Link to="/" className="flex items-center">
            <h1 className="text-3xl text-gray-800 dark:text-gray-300">Cliq</h1>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {appNavItems.map((item, index) => (
              <DesktopNavItem
                key={item.name}
                index={index}
                item={item}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                isPathActive={isPathActive}
                isItemActive={isItemActive}
              />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <form>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="h-11 w-80 rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
                <kbd className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <span>Ctrl</span>
                  <span>K</span>
                </kbd>
              </div>
            </form>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>

          <button
            onClick={() => setApplicationMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <UserDropdown />
          </div>
        </div>
      </div>

      <div
        className={`${
          isApplicationMenuOpen ? "flex" : "hidden"
        } items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 shadow-theme-md dark:border-gray-800 lg:hidden`}
      >
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <NotificationDropdown />
        </div>
        <UserDropdown />
      </div>
    </header>
  );
};

export default AppHeader;
