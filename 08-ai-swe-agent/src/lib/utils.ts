import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso + "Z").getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Builds a folder/file tree from a flat list of repo-relative paths, for the
// sidebar file explorer.
export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

export function buildFileTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const fullPath of paths.sort()) {
    const segments = fullPath.split("/");
    let level = root;
    let currentPath = "";

    segments.forEach((segment, idx) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isFile = idx === segments.length - 1;
      let node = level.find((n) => n.name === segment);

      if (!node) {
        node = {
          name: segment,
          path: currentPath,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        };
        level.push(node);
      }

      if (!isFile) level = node.children!;
    });
  }

  return root;
}
