import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import PeopleList from "@/pages/PeopleList";
import PersonDetail from "@/pages/PersonDetail";
import CardsList from "@/pages/CardsList";
import CardsByType from "@/pages/CardsByType";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/people" component={PeopleList} />
      <Route path="/people/:id" component={PersonDetail} />
      <Route path="/cards" component={CardsList} />
      <Route path="/cards/:type" component={CardsByType} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
