import Container from "../global/Container";
import CartButton from "./CartButton";
import DarkMode from "./DarkMode";
import LinkDropdown from "./LinkDropdown";
import Logo from "./Logo";
import NavSearch from "./NavSearch";
import CategoriesNav from "./CategoriesNav";
import { Suspense } from "react";
function Navbar() {
  return (
    <nav className="border-b">
      <Container className="flex flex-col  sm:flex-row  sm:justify-between sm:items-center flex-wrap py-8 gap-4">
        <Logo />

        <Suspense>
          <NavSearch />
        </Suspense>
        <div className="flex gap-4 items-center">
          <CategoriesNav />
          <CartButton />
          <DarkMode />
          <LinkDropdown />
        </div>
      </Container>
    </nav>
  );
}
export default Navbar;
