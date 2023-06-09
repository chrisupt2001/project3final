/** @format */

//** @format */

import supabase from "./supabase";

const getLastAddedTodo = async (user_id) => {
  const { data, error } = await supabase
    .from("todo")
    .select("*")
    .eq("user_id", user_id)
    .limit(1);
  if (error) {
    return {
      success: false,
      error,
    };
  }
  return {
    success: true,
    data,
  };
};

const getTodoList = async (todoType) => {
  const { data, error } = await supabase
    .from("todo")
    .select("*")
    .eq("todoType", todoType)
    .order("created_at", { ascending: true })
    .limit(5);
  if (error) {
    return {
      success: false,
      error,
    };
  }
  return {
    success: true,
    data,
  };
};

const getUserBySlug = async (name) => {
  const { data, error } = await supabase
    .from("profile")
    .select("user_id")
    .eq("name", name)
    .limit(1)
    .single();
  if (error) {
    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
    data,
  };
};

const getLatestUsers = async (num = 5) => {
  const { data, error } = await supabase
    .from("profile")
    .select("name, slug")
    .order("created_at", { ascending: false })
    .limit(num);

  if (error) {
    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
    data,
  };
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  return { success: !error, error };
};

// const addNewLink = async (user_id, url, title, order, linkType = "link") => {
const addNewTodo = async (user_id, title, order, todoType) => {
  // linkRequestData.data = null;
  // const insertResponse = await supabase.from("links").insert({
  const insertResponse = await supabase.from("todo").insert({
    order,
    title,
    user_id,
    todoType,
    // url,
  });

  if (insertResponse.error) {
    return {
      success: false,
      error: insertResponse.error,
    };
  }
  return {
    success: true,
    message: "successfully added",
    data: insertResponse.data,
  };
};
// //***************DELETE A TODO******************
const deleteNewLink = async (user_id, title, order, linkType = "todo") => {
  // linkRequestData.data = null;
  // const insertResponse = await supabase.from("links").insert({
  const deleteResponse = await supabase
    .from("todo")

    .delete({
      order,
      title,
      user_id,
      todoType,
    });

  if (deleteResponse.error) {
    return {
      success: false,
      error: deleteResponse.error,
    };
  }
  return {
    success: true,
    message: "successfully deleted",
    data: deleteResponse.data,
  };
};

const getCurrentUser = async () => {
  // grab the session from supabase (which handles all authentication)
  const session = await supabase.auth.getSession();
  // if a user property exists in the session.data.session object
  if (session?.data?.session?.user) {
    //grab from the meta table we created for the current logged
    // in user, and attach it to the user object under the key
    // barge meta, this is so we can access for the current user's
    // name and slug
    const { data: bargeMeta, error } = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", session.data.session.user.id)
      .single();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    // here we take the user from the session.data.session
    // object and attach to it a property bargeMeta
    // that holds the name and slug (and some other info
    // that is not important)
    // const { data: socialLinks } = await getSocialLinks(
    //   session.data.session.user.id
    // );
    // if (socialLinks?.error) {
    //   return socialLinks;
    // }

    const { data: groceries } = await getGroceryList(
      session.data.session.user.id
    );
    if (groceries?.error) {
      return groceries;
    }

    const { data: linkLinks } = await getLinksLinks(
      session.data.session.user.id
    );
    if (linkLinks?.error) {
      return socialLinks;
    }

    const user = {
      ...session.data.session.user,
      bargeMeta,
      // socialLinks,
      linkLinks,
      groceries,
    };

    return {
      success: true,
      data: user,
    };
  }
  return {
    success: true,
    data: null,
  };
};

// const linkRequestData = {
//   data: null,
// };

const getLinks = async (userId) => {
  // if (linkRequestData.data) {
  //   return linkRequestData.data;
  // }

  const { data, error } = await supabase
    // choose the todo  table to take information from
    //.from("links")
    .from("todo")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    return {
      success: false,
      error,
    };
  }

  // linkRequestData.data = { success: true, data };

  return { success: true, data };
};

const getLinksFiltered = async (userId, by) => {
  if (!["Grocery List", "Homework Due Dates", "Event List"].includes(by)) {
    return false;
  }

  if (!userId) {
    return {
      success: false,
      error: {
        message: "not logged in",
      },
    };
  }

  const { success, error = null, data = null } = await getLinks(userId);
  if (!!error) {
    return {
      success: false,
      error,
    };
  }

  const linksFiltered = data
    .filter(({ todoType }) => todoType === by)
    .sort((a, b) => a.order - b.order);

  return {
    success: true,
    data: linksFiltered,
  };
};

// const getSocialLinks = (userId) => {
//   return getLinksFiltered(userId, "Grocery List");
// };

const getGroceryList = (userId) => {
  return getLinksFiltered(userId, "Grocery List");
};

const getLinksLinks = (userId) => {
  return getLinksFiltered(userId, "Events List");
};

const getHomeworkList = (userId) => {
  return getLinksFiltered(userId, "Homework Due Dates");
};

// register a user//
/**
 * Register a user by passing in an email, password, name and slug
 * @param {*} email
 * @param {*} password
 * @param {*} name
 * @param {*} slug
 * @returns plain old javascript object with success, message and optionally, the rest of the addMetaResponse.data object
 */
const registerUser = async (email, password, name, slug) => {
  const { data: registerData, error: registerError } = await supabase
    .from("profile")
    .select("*")
    .eq("slug", slug);
  if (registerError) {
    return {
      success: false,
      error: registerError,
    };
  }
  if (registerData.length > 0) {
    return {
      success: false,
      error: registerError,
    };
  }

  const authResponse = await supabase.auth.signUp({
    email,
    password,
  });

  if (authResponse.error) {
    return {
      success: false,
      error: authResponse.error,
    };
  }

  if (authResponse.data.user) {
    const addMetaResponse = await supabase
      .from("profile")
      .insert([{ user_id: authResponse.data.user.id, name, slug }]);

    if (addMetaResponse.error) {
      return {
        success: false,
        error: addMetaResponse.error,
      };
    }
    return {
      success: true,
      message:
        "Registration successful, please wait a few moments to be taken to the login page",
      ...addMetaResponse.data,
    };
  }

  return {
    success: false,
    error: {
      message: "An unknown error has occurred",
    },
  };
};

/**
 * Log in a user
 * @param {*} email
 * @param {*} password
 * @returns plain old javascript object with success, message and optionally, the rest of the addMetaResponse.data object
 *
 * NOTE, it previously responded with error as the name of the key, it was renamed to message
 * for consistency
 */
const loginUser = async (email, password) => {
  const authResponse = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authResponse.error) {
    return {
      success: false,
      error: authResponse.error,
    };
  }

  if (authResponse.data.user) {
    const meta = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", authResponse.data.user.id);

    if (meta.error) {
      return {
        success: false,
        error: meta.error,
      };
    }
    return {
      ...authResponse,
      meta,
      message: "Successfully logged in, please wait to be redirected",
      success: true,
    };
  }

  return {
    success: false,
    error: {
      message: "An unknown error has occurred",
    },
  };
};

export {
  loginUser,
  registerUser,
  getLinksLinks,
  // getSocialLinks,
  getCurrentUser,
  addNewTodo,
  deleteNewLink,
  logout,
  getLatestUsers,
  getUserBySlug,
  getTodoList,
  getLastAddedTodo,
  getGroceryList,
  getHomeworkList,
};
