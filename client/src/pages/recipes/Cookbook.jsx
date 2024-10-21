import Recipe from "./Recipe";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useCallback } from "react";
import { UserContext } from "../../context/UserContext";
import { useFormik, Field, FieldArray, Formik, Form } from "formik";
import Dropzone from 'react-dropzone'
import toast from "react-hot-toast";
import { object, string, array, number } from "yup";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import Loading from '../../components/Loading'



function Cookbook() {
  const { user, updateRecipes } = useContext(UserContext);
  const nav = useNavigate();
  const [pages, setPages] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false)
  const [recipeForm, setRecipeForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * 10;
  const endIndex = currentPage * 10;
  const [files, setFiles] = useState([]);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((currentPage) => currentPage - 1);
    }
  };

  const handleNext = () => {
    if (pages > currentPage) {
      setCurrentPage((currentPage) => currentPage + 1);
    }
  };

  const newRecipe = () => {

    formik.resetForm()
    setFiles('')
    setRecipeForm(!recipeForm);
  };

  const recipeSchema = object({
    name: string()
    .max(50, 'Name must be 50 characters or less')
    .required('Name is required'),
    instructions: string()
    .max(2000, 'Must be 2000 characters or less'),
    source: string()
    .max(50, 'Source must be 50 characters or less'),
    category: string()
    .required('Category is required')
    .oneOf(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']),
    prep_time: string()
    .required('Prep Time is required'),
    ingredients: array().of(
      object({
        name: string()
        .max(50, 'Name must be 50 characters or less')
        .required('Name is required'),
        amount: number('Must be a number')
        .required('Amount is required'),
        measurement_unit: string()
        .oneOf(['tsp', 'tbsp', 'cups', 'pt', 'qt', 'gal', 'oz', 'fl oz', 'lb', 'unit'], 'Must match approved units'),
      }),
    ),
  });

  const initialValues = {
    name: "",
    instructions: "",
    category: "",
    prep_time: "",
    source: "",
    ingredients: [
      {
        name: "",
        amount: "",
        measurement_unit: "unit",
      }
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: recipeSchema,
    onSubmit: (formData) => {

      formData['ingredients'] = JSON.stringify(formData['ingredients'])

      const fd = new FormData()

      if(files[0] !== undefined) {
        fd.set("image_file", files[0])
      }

      for(let key in formData) { fd.set(key, formData[key])}

      console.log(fd)
      fetch("/api/v1/recipes", {
        method: "POST",
        body: fd,
      })
      .then((res) => {
        if (res.ok) {
          return res.json().then((data) => {
            updateRecipes([...user.recipes, data])
            newRecipe();
            nav("/cookbook");
            toast.success("Recipe Created");
          });
        } else {

          return res.json().then((data) => {


            const message = data.Error
            toast.error(message)
          })
        }
      });






    },
  });

  const removeFile = (name) => {
    setFiles(files => files.filter(file => file.name !== name ))
  }

  useEffect(() => {
      setPages((pages) => Math.ceil(user.recipes.length / 10))
      setIsLoaded(true)


  }, [user]);

  return (
    <>
    {
      isLoaded ?

        // CookBook Page
        <div className="w-full h-[92%] flex flex-col flex-grow px-6 ">

            {/* CookBook Title */}
            <div className="h-[5%] flex flex-row justify-between items-center">
              <p className="text-2xl tracking-wide">My Cookbook</p>
              <button className="h-[80%] w-[30%] rounded-lg bg-shittake text-white sm:w-[200px]" onClick={newRecipe}>
                New Recipe +
              </button>
            </div>

            {/* Recipe Cards */}
            <div className="h-[90%] border border-2 border-shittake rounded-xl overflow-y-scroll scrollbar scrollbar-thumb-shittake p-4 grid sm:grid-cols-2 gap-4">
              {user.recipes.length > 0 ? (
                user.recipes
                  .slice(startIndex, endIndex)
                  .map((recipe) => <Recipe key={recipe.id} {...recipe} />)
              ) : (
                <p className='w-full h-full text-center text-4xl flex justify-center items-center text-shittake'>No Recipes Yet...</p>
              )}
            </div>

            {/* Page Nav */}
            <div className="h-[5%] text-xl flex justify-center items-center">
              <div className='h-[70%] border bg-champagne flex flex-row items-center gap-8 text-xl'>
                <button className="" onClick={handlePrev}>
                  <ArrowBackIcon />
                </button>
                  {currentPage} of {pages}
                <button className="" onClick={handleNext}>
                  <ArrowForwardIcon />
                </button>
              </div>
            </div>

          {/* New Recipe Form */}
          {recipeForm && (
            <div className="fixed inset-0 flex justify-center items-center transition-colors backdrop-blur">
              <Formik onSubmit={formik.handleSubmit} initialValues={initialValues}>
                <Form className="size-[95%] text-md sm:size-[90%] flex flex-col justify-center items-center">

                  {/* Form Exit */}
                  <div className='h-[4%] w-full flex items-start '>
                    <button className="bg-champagne border text-black rounded-xl flex justify-center w-full " type="button" onClick={newRecipe}>
                      <CloseIcon style={{size: '50px'}}/>
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className='h-[92%] w-full bg-white rounded-lg p-2 border border-shittake flex flex-col gap-2 overflow-y-scroll scrollbar scrollbar-thumb-shittake text-base'>

                    {/* Name Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="name">
                        Name
                      </label>


                      <input
                        type="text"
                        name="name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                        className="border rounded-md p-1"
                        placeholder="Name your recipe"
                        />

                        {formik.errors.name && formik.touched.name && (
                          <div className="text-shittake flex items-center">❌  {formik.errors.name}</div>
                        )}

                    </div>

                    {/* Category Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="category">
                        Category
                      </label>

                      <select
                      as='select'
                      name="category"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.category}
                      className="border rounded-md p-1"
                      placeholder="Category"
                      >
                        <option value='' className='bold italic'>Select Category</option>
                        <option value='Breakfast'>🥣 Breakfast</option>
                        <option value='Lunch'>🥪 Lunch</option>
                        <option value='Dinner'>🍽️ Dinner</option>
                        <option value='Snack'>🍎 Snack</option>
                        <option value='Dessert'>🍦 Dessert</option>
                      </select>


                      {formik.errors.category && formik.touched.category && (
                        <div className="text-shittake flex items-center">❌  {formik.errors.category}</div>
                      )}

                    </div>

                    {/* Ingredients Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="ingredients">
                        Ingredients
                      </label>

                      <FieldArray name="ingredients" validateOnChange={true}>
                        {(fieldArrayProps) => {
                          const ingredients = formik.values.ingredients || [];

                          const handleAddIngredient = () => {
                            formik.setFieldValue('ingredients', [...ingredients, { name: "", amount: "", measurement_unit: "unit" }]);
                          };

                          const handleDeleteIngredient = (index) => {

                            if (index !== 0) {

                              const updatedIngredients = [...formik.values.ingredients]
                              updatedIngredients.splice(index, 1)
                              formik.setFieldValue('ingredients',updatedIngredients)

                            } else if (index === 0) {
                              formik.setFieldValue('ingredients[0]', { name: "", amount: "", measurement_unit: "unit" })
                            }

                          }

                          return (
                            <>
                              {ingredients.map((ingredient, index) => (
                                <div key={index} className="flex flex-row w-full gap-1 text-sm sm:text-base">

                                  {/* Ingredient Number */}
                                  <div className='w-[3%] sm:w-[5%] h-full text-black flex justify-center items-start'>
                                    <p className='text-xl flex items-center'>{index >= 0 ? index + 1 : ''}</p>
                                  </div>

                                  {/* Ingredient Name */}
                                  <Field name={`ingredients[${index}].name`}
                                    value={
                                      formik.values.ingredients[index]
                                        ? formik.values.ingredients[index].name
                                        : ""
                                    }
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Name"
                                    className="border rounded-md p-1 w-[50%] sm:w-[50%]"/>


                                  {/* Ingredient Amount */}
                                  <Field name={`ingredients[${index}].amount`}
                                    placeholder="#"
                                    type='number'
                                    value={
                                      formik.values.ingredients[index]
                                        ? formik.values.ingredients[index].amount
                                        : ""
                                    }
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    step='1'
                                    min="1"
                                    max="10000"
                                    className="border rounded-md p-1 w-[10%]"/>

                                  {/* Ingredient Measurement */}
                                  <Field as='select'
                                    name={`ingredients[${index}].measurement_unit`}
                                    placeholder="Unit"
                                    value={
                                      formik.values.ingredients[index]
                                        ? formik.values.ingredients[index].measurement_unit
                                        : ""
                                    }
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    className="border rounded-md p-1 w-[25%] sm:w-[30%]">

                                      <option value='unit'>Unit</option>
                                      <option value='tsp'>Teaspoon</option>
                                      <option value='tbsp'>Tablespoon</option>
                                      <option value='cups'>Cup</option>
                                      <option value='pt'>Pint</option>
                                      <option value='qt'>Quart</option>
                                      <option value='gal'>Gallon</option>
                                      <option value='oz'>Ounce</option>
                                      <option value='fl oz'>Fluid Ounce</option>
                                      <option value='lb'>Pound</option>

                                  </Field>

                                  {/* Add + Delete Buttons */}
                                  <div className={`w-[14%] sm:w-[7%] flex flex-row`}>
                                    {/* Remove Ingredient */}
                                    <button type="button" onClick={() => handleDeleteIngredient(index)} className="text-black rounded-lg">
                                      <RemoveIcon />
                                    </button>

                                    {/* Add Ingredient */}
                                    <button type="button" onClick={handleAddIngredient} className="text-black rounded-lg">
                                      <AddIcon />
                                    </button>
                                  </div>


                                </div>
                              ))}
                            </>
                          );
                        }}
                      </FieldArray>


                      {formik.errors.ingredients && formik.touched.ingredients ? (

                        formik.touched.ingredients.map((ing, index) => {
                          if(Object.values(ing).every(value => value === true) && formik.errors.ingredients[index]) {
                            const errors = formik.errors.ingredients[index]
                            return Object.entries(errors).map(err =>
                              <div className="text-shittake flex gap-1 flex items-end text-base">
                                <p>❌</p>
                                <p className='text-xl'>{index + 1}:</p>
                                <p>{err[1]}</p>
                              </div>
                            )

                          }

                        })

                      )
                      :
                      <></>
                      }



                    </div>

                    {/* Prep Time Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="prep_time">
                        Prep Time
                      </label>

                      <select
                        as='select'
                        name="prep_time"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.prep_time}
                        className="border rounded-md p-1"
                        placeholder="Prep time"
                      >
                        <option value=''>Select Prep Time</option>
                        <option value='>5min'>🏃🏻💨 {'>'}5 min</option>
                        <option value='5-30 min'>⚡️ 5-30 min</option>
                        <option value='30-60 min'>⏲️ 30-60 min</option>
                        <option value='1-3 hr'>👩🏽‍🍳 1-3 hr</option>
                        <option value='All Day'>📆 All Day</option>
                      </select>

                      {formik.errors.prep_time && formik.touched.prep_time && (
                          <div className="text-shittake flex items-center">❌  {formik.errors.prep_time}</div>
                      )}



                    </div>

                    {/* Source Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="source">
                        Source
                      </label>

                      <input
                        type="text"
                        name="source"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.source}
                        className="border rounded-md p-1"
                        placeholder="Enter Source"
                      />
                      {formik.errors.source && formik.touched.source && (
                      <div className="text-shittake flex items-center">❌  {formik.errors.source}</div>
                      )}


                    </div>

                    {/* Img Upload Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="recipe_img">
                        Recipe Image
                      </label>

                      <Dropzone onDrop={acceptedFiles => {
                        setFiles(acceptedFiles.map(file => Object.assign(file, {
                          preview: URL.createObjectURL(file)
                        })));}
                      }>
                        {({getRootProps, getInputProps}) => (
                          <section>
                            <div {...getRootProps()}>
                              <input {...getInputProps()} />
                              <p className='bg-shittake border text-white p-2 rounded-lg'>

                                <UploadFileIcon />
                                Drag or Click Here

                              </p>
                            </div>
                          </section>
                        )}
                      </Dropzone>


                      {files[0] ?
                      <div className='flex flex-row justify-between bg-champagne p-2 m-2 rounded-lg '>

                        <div className='flex flex-row'>
                          <img alt='img_preview' src={files[0].preview} className='h-[50px] w-[50px]' />

                          <div className='flex flex-col'>
                            <p>{files[0].name}</p>
                            <p className='flex items-center text-sm'>{Math.round(files[0].size / 1024)} KB</p>


                          </div>

                        </div>


                        <div className='flex flex-col'>

                          <button
                            className='bg-shittake text-white rounded-lg p-1'
                            onClick={() => removeFile(files[0].name)}
                          >
                            Remove
                          </button>

                        </div>

                      </div>
                      :
                      <p className='pl-2'>No Img Uploaded</p>
                      }

                    </div>

                    {/* Instructions Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="instructions">
                        Instructions
                      </label>
                      <textarea
                        name="instructions"
                        as='textarea'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.instructions}
                        className="border rounded-md p-1 min-h-[150px]"
                        placeholder="Write instructions here..."
                      />

                      {formik.errors.instructions && formik.touched.instructions && (
                          <div className="text-shittake flex items-center">❌  {formik.errors.instructions}</div>
                      )}

                    </div>

                  </div>

                  {/* Form Submit */}
                  <div className='h-[4%] w-full flex items-end sm:mt-2'>
                    <button type ='submit' className="text-lg bg-champagne border border-black text-black hover:bg-transparent rounded-lg w-full">
                      Add Recipe
                    </button>
                  </div>


                </Form>
              </Formik>
            </div>
          )}
        </div>

      :

      <Loading />

    }

    </>
  )
}

export default Cookbook;